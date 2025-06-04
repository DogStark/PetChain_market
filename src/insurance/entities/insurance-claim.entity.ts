import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { InsurancePolicy } from './insurance-policy.entity';
import { ClaimDocument } from './claim-document.entity';
import { PreAuthorization } from './pre-authorization.entity';

@Entity('insurance_claims')
export class InsuranceClaim {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  claimNumber: string;

  @Column()
  treatmentDate: Date;

  @Column()
  diagnosis: string;

  @Column('text')
  treatmentDescription: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  approvedAmount: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  paidAmount: number;

  @Column({ 
    type: 'enum', 
    enum: ['draft', 'submitted', 'under_review', 'approved', 'denied', 'paid', 'partially_paid'],
    default: 'draft'
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  denialReason: string;

  @Column()
  veterinarianName: string;

  @Column()
  veterinarianLicense: string;

  @Column()
  clinicName: string;

  @Column()
  clinicAddress: string;

  @Column({ type: 'json', nullable: true })
  providerResponse: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => InsurancePolicy, policy => policy.claims)
  @JoinColumn({ name: 'policy_id' })
  policy: InsurancePolicy;

  @Column({ name: 'policy_id' })
  policyId: number;

  @OneToMany(() => ClaimDocument, document => document.claim)
  documents: ClaimDocument[];

  @ManyToOne(() => PreAuthorization, { nullable: true })
  @JoinColumn({ name: 'pre_authorization_id' })
  preAuthorization: PreAuthorization;

  @Column({ name: 'pre_authorization_id', nullable: true })
  preAuthorizationId: number;
}
