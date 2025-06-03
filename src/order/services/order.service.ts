import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create(createOrderDto);
    return this.orderRepository.save(order);
  }

  async findAll(userId?: string): Promise<Order[]> {
    if (userId) {
      return this.orderRepository.find({ where: { userId }, order: { createdAt: 'DESC' } });
    }
    return this.orderRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return this.orderRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }

  async getOrderHistory(userId: string): Promise<Order[]> {
    return this.orderRepository.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async getOrderAnalytics(): Promise<any> {
    // Example: total orders, revenue, etc.
    const [orders, count] = await this.orderRepository.findAndCount();
    const totalRevenue = orders.reduce((sum: number, o: Order) => sum + Number(o.total), 0);
    return { totalOrders: count, totalRevenue };
  }
}
