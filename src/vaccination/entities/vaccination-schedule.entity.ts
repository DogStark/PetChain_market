import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Pet } from '../../pets/entities/pet.entity';

export enum VaccinationStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

@Entity('vaccination_schedules')
export class VaccinationSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pet, pet => pet.vaccinationSchedules)
  pet: Pet;

  @Column()
  petId: string;

  @Column()
  vaccineName: string;

  @Column()
  vaccineType: string;

  @Column('date')
  scheduledDate: Date;

  @Column({
    type: 'enum',
    enum: VaccinationStatus,
    default: VaccinationStatus.SCHEDULED
  })
  status: VaccinationStatus;

  @Column({ nullable: true })
  reminderSent: boolean;

  @Column('date', { nullable: true })
  reminderSentAt: Date;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
