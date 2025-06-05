import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Customer } from '../../customer-pet/entities/customer-pet.entity';
import { Payment } from '../../payment/entities/payment.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column('jsonb')
  items!: Array<{ productId: string; quantity: number; price: number }>;

  @Column('decimal')
  total!: number;

  @Column({ default: 'pending' })
  status!: string;

  @Column({ nullable: true })
  paymentId?: string;

  @OneToMany(() => Payment, payment => payment.order)
  payments!: Payment[];

  @Column({ nullable: true })
  paymentStatus?: string;

  @ManyToOne(() => Customer, customer => customer.orders)
  customer!: Customer;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
