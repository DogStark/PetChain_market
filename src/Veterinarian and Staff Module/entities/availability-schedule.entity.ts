import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Veterinarian } from './veterinarian.entity';

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

@Entity('availability_schedules')
export class AvailabilitySchedule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: DayOfWeek })
  dayOfWeek!: DayOfWeek;

  @Column({ type: 'time' })
  startTime!: string;

  @Column({ type: 'time' })
  endTime!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'date', nullable: true })
  effectiveFrom!: Date;

  @Column({ type: 'date', nullable: true })
  effectiveTo!: Date;

  @ManyToOne(() => Veterinarian, vet => vet.availabilitySchedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'veterinarianId' })
  veterinarian!: Veterinarian;

  @Column()
  veterinarianId!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
