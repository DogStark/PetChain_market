import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  EmergencyPriority,
  AppointmentStatus,
  TriageLevel,
} from '../../common/enums/emergency.enum';

@Entity('emergency_appointments')
export class EmergencyAppointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  petName: string;

  @Column()
  petSpecies: string;

  @Column()
  petAge: number;

  @Column()
  ownerName: string;

  @Column()
  ownerPhone: string;

  @Column()
  ownerEmail: string;

  @Column()
  emergencyContactPhone: string;

  @Column('text')
  symptoms: string;

  @Column('text', { nullable: true })
  additionalNotes: string;

  @Column({
    type: 'enum',
    enum: EmergencyPriority,
    default: EmergencyPriority.MEDIUM,
  })
  priority: EmergencyPriority;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({
    type: 'enum',
    enum: TriageLevel,
    default: TriageLevel.NON_URGENT,
  })
  triageLevel: TriageLevel;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ type: 'timestamp', nullable: true })
  scheduledTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  arrivalTime: Date;

  @Column({ default: false })
  emergencyContactNotified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
