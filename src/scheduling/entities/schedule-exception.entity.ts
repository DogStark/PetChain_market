import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Veterinarian } from '../../Veterinarian and Staff Module/entities/veterinarian.entity';

export enum ExceptionType {
  BREAK = 'break',
  HOLIDAY = 'holiday',
  TIME_OFF = 'time_off',
  SICK_LEAVE = 'sick_leave',
  VACATION = 'vacation',
  PERSONAL = 'personal',
  OTHER = 'other'
}

@Entity('schedule_exceptions')
export class ScheduleException {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ExceptionType })
  type: ExceptionType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ default: false })
  isRecurring: boolean;

  @Column({ type: 'simple-json', nullable: true })
  recurrenceRule: {
    frequency?: string;
    interval?: number;
    daysOfWeek?: number[];
    until?: Date;
    count?: number;
  };

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Veterinarian, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'veterinarianId' })
  veterinarian: Veterinarian;

  @Column()
  veterinarianId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
