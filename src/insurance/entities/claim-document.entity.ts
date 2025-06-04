import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { InsuranceClaim } from './insurance-claim.entity';

@Entity('claim_documents')
export class ClaimDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileName: string;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column()
  fileSize: number;

  @Column()
  filePath: string;

  @Column({ type: 'enum', enum: ['invoice', 'medical_record', 'prescription', 'lab_result', 'other'] })
  documentType: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploadedAt: Date;

  @ManyToOne(() => InsuranceClaim, claim => claim.documents)
  @JoinColumn({ name: 'claim_id' })
  claim: InsuranceClaim;

  @Column({ name: 'claim_id' })
  claimId: number;
}

