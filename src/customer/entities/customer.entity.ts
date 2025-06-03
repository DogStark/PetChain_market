import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { Order } from '../../order/entities/order.entity';
import { Payment } from '../../payment/entities/payment.entity';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'json', nullable: true })
  billingAddress: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  shippingAddress: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Subscription, subscription => subscription.customer)
  subscriptions: Subscription[];

  @OneToMany(() => Order, order => order.customer)
  orders: Order[];

  @OneToMany(() => Payment, payment => payment.customer)
  payments: Payment[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
