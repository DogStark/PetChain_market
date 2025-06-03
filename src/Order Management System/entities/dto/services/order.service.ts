import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderHistory } from '../entities/order-history.entity';
import { Cart } from '../entities/cart.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { CancelOrderDto } from '../dto/cancel-order.dto';
import { OrderQueryDto } from '../dto/order-query.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderHistory)
    private orderHistoryRepository: Repository<OrderHistory>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}

  async createOrderFromCart(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    // Get cart with items
    const cart = await this.cartRepository.findOne({
      where: { id: createOrderDto.cartId, userId },
      relations: ['items', 'items.product']
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;

    // Generate order number
    const orderNumber = this.generateOrderNumber();

    // Create order
    const order = this.orderRepository.create({
      orderNumber,
      userId,
      subtotal,
      tax,
      shipping,
      total,
      status: OrderStatus.PENDING,
      shippingAddress: createOrderDto.shippingAddress,
      billingAddress: createOrderDto.billingAddress || createOrderDto.shippingAddress,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create order items
    const orderItems = cart.items.map(cartItem => this.orderItemRepository.create({
      orderId: savedOrder.id,
      productId: cartItem.productId,
      productName: cartItem.product.name,
      price: cartItem.price,
      quantity: cartItem.quantity,
      total: cartItem.price * cartItem.quantity,
      productSnapshot: {
        name: cartItem.product.name,
        description: cartItem.product.description,
        // Add other relevant product details
      }
    }));

    await this.orderItemRepository.save(orderItems);

    // Create order history entry
    await this.createOrderHistory(savedOrder.id, null, OrderStatus.PENDING, 'Order created');

    // Clear cart after successful order creation
    await this.cartRepository.remove(cart);

    return this.getOrderById(savedOrder.id, userId);
  }

  async updateOrderStatus(orderId: string, updateDto: UpdateOrderStatusDto, updatedBy?: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Validate status transition
    if (!this.isValidStatusTransition(order.status, updateDto.status)) {
      throw new BadRequestException(`Cannot transition from ${order.status} to ${updateDto.status}`);
    }

    const previousStatus = order.status;
    
    // Update order
    await this.orderRepository.update(orderId, {
      status: updateDto.status,
      trackingNumber: updateDto.trackingNumber || order.trackingNumber,
      shippedAt: updateDto.status === OrderStatus.SHIPPED ? new Date() : order.shippedAt,
      deliveredAt: updateDto.status === OrderStatus.DELIVERED ? new Date() : order.deliveredAt,
    });

    // Create history entry
    await this.createOrderHistory(orderId, previousStatus, updateDto.status, updateDto.notes, updatedBy);

    return this.orderRepository.findOne({ 
      where: { id: orderId }, 
      relations: ['items', 'items.product'] 
    });
  }

  async cancelOrder(orderId: string, cancelDto: CancelOrderDto, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ 
      where: { id: orderId, userId } 
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if order can be cancelled
    const cancellableStatuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING];
    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    const previousStatus = order.status;

    // Update order
    await this.orderRepository.update(orderId, {
      status: OrderStatus.CANCELLED,
      cancelReason: cancelDto.reason,
      cancelledAt: new Date(),
    });

    // Create history entry
    await this.createOrderHistory(orderId, previousStatus, OrderStatus.CANCELLED, 
      `Order cancelled: ${cancelDto.reason}`, userId);

    return this.orderRepository.findOne({ 
      where: { id: orderId }, 
      relations: ['items', 'items.product'] 
    });
  }

  async getOrderById(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['items', 'items.product']
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getOrderHistory(userId: string, query: OrderQueryDto): Promise<{ orders: Order[], total: number }> {
    const { status, fromDate, toDate, page, limit } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('order.userId = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (fromDate && toDate) {
      queryBuilder.andWhere('order.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(fromDate),
        toDate: new Date(toDate)
      });
    }

    queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return { orders, total };
  }

  async getOrderStatusHistory(orderId: string, userId: string): Promise<OrderHistory[]> {
    // Verify order belongs to user
    const order = await this.orderRepository.findOne({ 
      where: { id: orderId, userId } 
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.orderHistoryRepository.find({
      where: { orderId },
      order: { createdAt: 'ASC' }
    });
  }

  // Admin methods
  async getAllOrders(query: OrderQueryDto): Promise<{ orders: Order[], total: number }> {
    const { status, fromDate, toDate, page, limit } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.user', 'user');

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (fromDate && toDate) {
      queryBuilder.andWhere('order.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(fromDate),
        toDate: new Date(toDate)
      });
    }

    queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return { orders, total };
  }

  async fulfillOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException('Order must be confirmed before fulfillment');
    }

    return this.updateOrderStatus(orderId, { 
      status: OrderStatus.PROCESSING 
    }, 'system');
  }

  // Private helper methods
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  private isValidStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
    const validTransitions = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: []
    };

    return validTransitions[from]?.includes(to) || false;
  }

  private async createOrderHistory(
    orderId: string, 
    fromStatus: OrderStatus, 
    toStatus: OrderStatus, 
    notes?: string, 
    updatedBy?: string
  ): Promise<void> {
    const history = this.orderHistoryRepository.create({
      orderId,
      fromStatus,
      toStatus,
      notes,
      updatedBy
    });

    await this.orderHistoryRepository.save(history);
  }
}
