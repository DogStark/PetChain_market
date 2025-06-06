import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Subscription } from './subscription.entity';
import { BillingCycle } from '../../shared/common/enums/billing-cycle.enum';

@Entity()
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column('text')
  description!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'enum', enum: BillingCycle })
  billingCycle!: BillingCycle;

  @Column()
  deliveryFrequency!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column('simple-array')
  productIds!: string[];

  @Column({ type: 'json', nullable: true })
  features!: Record<string, any>;

  @OneToMany(() => Subscription, subscription => subscription.plan)
  subscriptions!: Subscription[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
