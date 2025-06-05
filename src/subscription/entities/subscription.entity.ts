import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../customer-pet/entities/customer-pet.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { SubscriptionStatus } from '../../shared/common/enums/subscription-status.enum';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @ManyToOne(() => Customer, customer => customer.subscriptions)
  @JoinColumn()
  customer!: Customer;

  @ManyToOne(() => SubscriptionPlan, plan => plan.subscriptions)
  @JoinColumn()
  plan!: SubscriptionPlan;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status!: SubscriptionStatus;

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date', nullable: true })
  endDate!: Date | null;

  @Column()
  billingDay!: number;

  @Column({ type: 'json', nullable: true })
  customizations!: Record<string, any>;

  @Column({ type: 'date', nullable: true })
  nextBillingDate!: Date | null;

  @Column({ type: 'date', nullable: true })
  lastPaymentDate!: Date | null;

  @Column({ nullable: true })
  paymentFailureCount!: number;

  @Column({ type: 'text', nullable: true })
  lastPaymentError!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @OneToMany(() => Payment, payment => payment.subscription)
  payments!: Payment[];

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
