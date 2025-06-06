import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AvailabilitySchedule } from '../../Veterinarian and Staff Module/entities/availability-schedule.entity';

export enum RecurrenceType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
}

@Entity('schedule_patterns')
export class SchedulePattern {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: RecurrenceType, default: RecurrenceType.WEEKLY })
  recurrenceType: RecurrenceType;

  @Column({ type: 'simple-json', nullable: true })
  recurrenceRule: {
    interval?: number;
    daysOfWeek?: number[];
    daysOfMonth?: number[];
    monthsOfYear?: number[];
    positions?: number[];
  };

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'int', default: -1 })
  occurrences: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => AvailabilitySchedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'availabilityScheduleId' })
  availabilitySchedule: AvailabilitySchedule;

  @Column()
  availabilityScheduleId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
