import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  userId!: string;

  @Column({ type: 'varchar', nullable: true })
  sessionId!: string;

  @OneToMany(() => CartItem, cartItem => cartItem.cart, {
    cascade: true,
    eager: true,
  })
  items!: CartItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount!: number;

  @Column({ type: 'int', default: 0 })
  totalItems!: number;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
