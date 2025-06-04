import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AvailabilitySchedule } from '../../Veterinarian and Staff Module/entities/availability-schedule.entity';

export enum TimeSlotStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  BLOCKED = 'blocked',
  BREAK = 'break',
  HOLIDAY = 'holiday'
}

@Entity('time_slots')
export class TimeSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'enum', enum: TimeSlotStatus, default: TimeSlotStatus.AVAILABLE })
  status: TimeSlotStatus;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  appointmentId: string;

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
