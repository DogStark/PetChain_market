import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
  ) {}

  async findOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
    let cart: Cart;

    if (userId) {
      cart = await this.cartRepository.findOne({
        where: { userId },
        relations: ['items'],
      });
    } else if (sessionId) {
      cart = await this.cartRepository.findOne({
        where: { sessionId },
        relations: ['items'],
      });
    }

    if (!cart) {
      cart = this.cartRepository.create({
        userId,
        sessionId,
        items: [],
        totalAmount: 0,
        totalItems: 0,
        expiresAt: this.calculateExpirationDate(userId),
      });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  async addToCart(addToCartDto: AddToCartDto): Promise<CartResponseDto> {
    const { productId, productName, price, quantity, userId, sessionId } = addToCartDto;

    if (!userId && !sessionId) {
      throw new BadRequestException('Either userId or sessionId must be provided');
    }

    const cart = await this.findOrCreateCart(userId, sessionId);

    // Check if item already exists in cart
    const existingItem = cart.items.find(item => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.subtotal = existingItem.quantity * existingItem.price;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        productName,
        price,
        quantity,
        subtotal: price * quantity,
      });
      await this.cartItemRepository.save(newItem);
      cart.items.push(newItem);
    }

    await this.updateCartTotals(cart.id);
    return this.getCartById(cart.id);
  }

  async removeFromCart(cartId: string, productId: string): Promise<CartResponseDto> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['items'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemToRemove = cart.items.find(item => item.productId === productId);
    if (!itemToRemove) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.cartItemRepository.remove(itemToRemove);
    await this.updateCartTotals(cartId);

    return this.getCartById(cartId);
  }

  async updateCartItemQuantity(
    cartId: string,
    productId: string,
    updateDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['items'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = cart.items.find(item => item.productId === productId);
    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    item.quantity = updateDto.quantity;
    item.subtotal = item.price * item.quantity;
    await this.cartItemRepository.save(item);

    await this.updateCartTotals(cartId);
    return this.getCartById(cartId);
  }

  async getCart(userId?: string, sessionId?: string): Promise<CartResponseDto> {
    if (!userId && !sessionId) {
      throw new BadRequestException('Either userId or sessionId must be provided');
    }

    const cart = await this.findOrCreateCart(userId, sessionId);
    return this.mapCartToDto(cart);
  }

  async getCartById(cartId: string): Promise<CartResponseDto> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['items'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return this.mapCartToDto(cart);
  }

  async clearCart(cartId: string): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['items'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.cartItemRepository.remove(cart.items);
    cart.totalAmount = 0;
    cart.totalItems = 0;
    await this.cartRepository.save(cart);
  }

  async transferGuestCartToUser(sessionId: string, userId: string): Promise<CartResponseDto> {
    const guestCart = await this.cartRepository.findOne({
      where: { sessionId },
      relations: ['items'],
    });

    if (!guestCart) {
      return this.getCart(userId);
    }

    const userCart = await this.findOrCreateCart(userId);

    // Merge guest cart items into user cart
    for (const guestItem of guestCart.items) {
      const existingItem = userCart.items.find(item => item.productId === guestItem.productId);
      
      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
        existingItem.subtotal = existingItem.quantity * existingItem.price;
        await this.cartItemRepository.save(existingItem);
      } else {
        guestItem.cartId = userCart.id;
        await this.cartItemRepository.save(guestItem);
      }
    }

    // Remove guest cart
    await this.cartRepository.remove(guestCart);
    
    await this.updateCartTotals(userCart.id);
    return this.getCartById(userCart.id);
  }

  private async updateCartTotals(cartId: string): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['items'],
    });

    if (!cart) return;

    cart.totalAmount = cart.items.reduce((sum, item) => sum + Number(item.subtotal), 0);
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    await this.cartRepository.save(cart);
  }

  private calculateExpirationDate(userId?: string): Date {
    const now = new Date();
    // Logged users: 30 days, Guest users: 7 days
    const daysToAdd = userId ? 30 : 7;
    return new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  }

  private mapCartToDto(cart: Cart): CartResponseDto {
    return {
      id: cart.id,
      userId: cart.userId,
      sessionId: cart.sessionId,
      items: cart.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        price: Number(item.price),
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
      })),
      totalAmount: Number(cart.totalAmount),
      totalItems: cart.totalItems,
      expiresAt: cart.expiresAt,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  // Cleanup expired carts
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredCarts(): Promise<void> {
    const expiredCarts = await this.cartRepository.find({
      where: {
        expiresAt: { $lt: new Date() } as any,
      },
    });

    if (expiredCarts.length > 0) {
      await this.cartRepository.remove(expiredCarts);
      console.log(`Cleaned up ${expiredCarts.length} expired carts`);
    }
  }
}
