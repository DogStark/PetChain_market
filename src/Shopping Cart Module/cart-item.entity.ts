import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cart } from './cart.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  cartId!: string;

  @Column({ type: 'uuid' })
  productId!: string;

  @Column({ type: 'varchar' })
  productName!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal!: number;

  @ManyToOne(() => Cart, cart => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart!: Cart;
}
