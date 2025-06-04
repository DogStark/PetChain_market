import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Veterinarian } from '../../Veterinarian and Staff Module/entities/veterinarian.entity';

@Entity('scheduling_configs')
export class SchedulingConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 30 })
  defaultSlotDurationMinutes: number;

  @Column({ default: 0 })
  bufferTimeMinutes: number;

  @Column({ default: 7 })
  maxDaysInAdvance: number;

  @Column({ default: 1 })
  minHoursBeforeBooking: number;

  @Column({ default: 24 })
  cancellationPolicyHours: number;

  @Column({ default: true })
  allowRecurringAppointments: boolean;

  @Column({ default: false })
  allowOverlappingAppointments: boolean;

  @Column({ default: true })
  autoConfirmAppointments: boolean;

  @Column({ type: 'simple-json', nullable: true })
  workingHours: {
    monday?: { start: string; end: string }[];
    tuesday?: { start: string; end: string }[];
    wednesday?: { start: string; end: string }[];
    thursday?: { start: string; end: string }[];
    friday?: { start: string; end: string }[];
    saturday?: { start: string; end: string }[];
    sunday?: { start: string; end: string }[];
  };

  @Column({ type: 'simple-json', nullable: true })
  breakTimes: {
    monday?: { start: string; end: string }[];
    tuesday?: { start: string; end: string }[];
    wednesday?: { start: string; end: string }[];
    thursday?: { start: string; end: string }[];
    friday?: { start: string; end: string }[];
    saturday?: { start: string; end: string }[];
    sunday?: { start: string; end: string }[];
  };

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Veterinarian, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'veterinarianId' })
  veterinarian: Veterinarian;

  @Column({ nullable: true })
  veterinarianId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
