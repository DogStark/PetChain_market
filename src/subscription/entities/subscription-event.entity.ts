import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Subscription } from './subscription.entity';

@Entity()
export class SubscriptionEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Subscription, subscription => subscription.events)
  @JoinColumn()
  subscription: Subscription;

  @Column()
  eventType: string;

  @Column({ type: 'json', nullable: true })
  payload: Record<string, any>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
