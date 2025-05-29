import { Module } from '@nestjs/common';
import { ShoppingCartController } from './controllers/shopping_cart.controller';
import { ShoppingCartService } from './services/shopping_cart.service';

@Module({
  controllers: [ShoppingCartController],
  providers: [ShoppingCartService],
})
export class ShoppingCartModule {}
