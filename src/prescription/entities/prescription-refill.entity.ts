import { User } from '@/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Prescription } from './prescription.entity';
import { RefillStatus } from '../enums/refill-status.enum';

@Entity('prescription_refills')
export class PrescriptionRefill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Prescription, prescription => prescription.refills)
  prescription: Prescription;

  @Column()
  prescriptionId: string;

  @Column({ 
    type: 'enum', 
    enum: RefillStatus, 
    default: RefillStatus.REQUESTED 
  })
  status: RefillStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => User)
  requestedBy: User;

  @Column()
  requestedById: string;

  @ManyToOne(() => User, { nullable: true })
  processedBy: User;

  @Column({ nullable: true })
  processedById: string;

  @Column({ nullable: true, type: 'timestamp' })
  processedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
