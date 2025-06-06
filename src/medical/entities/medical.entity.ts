import { Pet } from '../../customer-pet/entities/pet.entity';
import { User } from '@/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('medical_history')
export class MedicalHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  type: string; // vaccination, checkup, surgery, medication, etc.

  @Column({ type: 'date' })
  date: Date;

  @Column({ nullable: true })
  veterinarian: string;

  @Column({ nullable: true })
  clinic: string;

  @Column({ type: 'json', nullable: true })
  medications: any[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  attachments: string[];

  @ManyToOne(() => Pet, pet => pet.medicalHistory)
  pet: Pet;

  @Column()
  petId: string;

  @ManyToOne(() => User)
  createdBy: User;

  @Column()
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
