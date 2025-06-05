import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../customer-pet/entities/customer-pet.entity';
import { Order } from '../../order/entities/order.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Customer, customer => customer.payments)
  @JoinColumn()
  customer!: Customer;

  @ManyToOne(() => Order, order => order.payments, { nullable: true })
  @JoinColumn()
  order!: Order;

  @ManyToOne(() => Subscription, subscription => subscription.payments, {
    nullable: true,
  })
  @JoinColumn()
  subscription!: Subscription;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column()
  currency!: string;

  @Column()
  paymentMethod!: string;

  @Column()
  status!: string;

  @Column({ nullable: true })
  transactionId!: string;

  @Column({ type: 'json', nullable: true })
  paymentDetails!: Record<string, any>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
