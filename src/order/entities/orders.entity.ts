import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from '../../payment/entities/payment.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, customer => customer.orders)
  @JoinColumn()
  customer: Customer;

  @ManyToOne(() => Subscription, { nullable: true })
  @JoinColumn()
  subscription: Subscription;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'json', nullable: true })
  shippingAddress: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  billingAddress: Record<string, any>;

  @OneToMany(() => OrderItem, item => item.order)
  items: OrderItem[];

  @OneToMany(() => Payment, payment => payment.order)
  payments: Payment[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
