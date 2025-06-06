import { Pet } from '../../customer-pet/entities/pet.entity';
import { User } from '@/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PrescriptionRefill } from './prescription-refill.entity';
import { PrescriptionStatus } from '../enums/prescription-status.enum';

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  instructions: string;

  @Column()
  dosage: string;

  @Column()
  frequency: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column()
  duration: number; // Duration in days

  @Column({ default: 0 })
  refillsAllowed: number;

  @Column({ default: 0 })
  refillsUsed: number;

  @Column({
    type: 'enum',
    enum: PrescriptionStatus,
    default: PrescriptionStatus.PENDING,
  })
  status: PrescriptionStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  externalReferenceId: string;

  @ManyToOne(() => Pet, pet => pet.prescriptions)
  pet: Pet;

  @Column()
  petId: string;

  @ManyToOne(() => User)
  veterinarian: User;

  @Column()
  veterinarianId: string;

  @ManyToOne(() => User, { nullable: true })
  fulfilledBy: User;

  @Column({ nullable: true })
  fulfilledById: string;

  @Column({ nullable: true, type: 'timestamp' })
  fulfilledAt: Date;

  @OneToMany(() => PrescriptionRefill, refill => refill.prescription)
  refills: PrescriptionRefill[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
