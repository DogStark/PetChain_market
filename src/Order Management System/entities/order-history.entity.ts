import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Order, OrderStatus } from './order.entity';

@Entity('order_history')
export class OrderHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order)
  order: Order;

  @Column({ type: 'enum', enum: OrderStatus })
  fromStatus: OrderStatus;

  @Column({ type: 'enum', enum: OrderStatus })
  toStatus: OrderStatus;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
