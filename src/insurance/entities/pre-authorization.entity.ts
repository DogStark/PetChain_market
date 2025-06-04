import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { InsurancePolicy } from './insurance-policy.entity';

@Entity('pre_authorizations')
export class PreAuthorization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  authorizationNumber: string;

  @Column()
  treatmentType: string;

  @Column('text')
  treatmentDescription: string;

  @Column('decimal', { precision: 10, scale: 2 })
  estimatedCost: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  authorizedAmount: number;

  @Column({ 
    type: 'enum', 
    enum: ['pending', 'approved', 'denied', 'expired'],
    default: 'pending'
  })
  status: string;

  @Column({ type: 'date' })
  expirationDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  providerResponse: Record<string, any>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => InsurancePolicy)
  @JoinColumn({ name: 'policy_id' })
  policy: InsurancePolicy;

  @Column({ name: 'policy_id' })
  policyId: number;
}