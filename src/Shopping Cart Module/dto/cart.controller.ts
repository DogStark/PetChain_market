import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(
    @Query('userId') userId?: string,
    @Query('sessionId') sessionId?: string,
  ): Promise<CartResponseDto> {
    return this.cartService.getCart(userId, sessionId);
  }

  @Post('add')
  async addToCart(@Body() addToCartDto: AddToCartDto): Promise<CartResponseDto> {
    return this.cartService.addToCart(addToCartDto);
  }

  @Delete(':cartId/items/:productId')
  async removeFromCart(
    @Param('cartId') cartId: string,
    @Param('productId') productId: string,
  ): Promise<CartResponseDto> {
    return this.cartService.removeFromCart(cartId, productId);
  }

  @Put(':cartId/items/:productId')
  async updateCartItemQuantity(
    @Param('cartId') cartId: string,
    @Param('productId') productId: string,
    @Body() updateDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.updateCartItemQuantity(cartId, productId, updateDto);
  }

  @Delete(':cartId/clear')
  async clearCart(@Param('cartId') cartId: string): Promise<{ message: string }> {
    await this.cartService.clearCart(cartId);
    return { message: 'Cart cleared successfully' };
  }

  @Post('transfer')
  async transferGuestCart(
    @Body() transferDto: { sessionId: string; userId: string },
  ): Promise<CartResponseDto> {
    return this.cartService.transferGuestCartToUser(transferDto.sessionId, transferDto.userId);
  }
}
