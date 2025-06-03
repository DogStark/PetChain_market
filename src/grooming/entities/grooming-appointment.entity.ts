import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GroomingPackage } from './grooming-package.entity';
import { AppointmentStatus } from '@/common/enums/emergency.enum';



@Entity('grooming_appointments')
export class GroomingAppointment {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  userId?: string;

  @Column()
  petId?: string;

  @ManyToOne(() => GroomingPackage)
  @JoinColumn({ name: 'packageId' })
  package?: GroomingPackage;

  @Column()
  packageId?: string;

  @Column('timestamp')
  appointmentTime?: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.IN_PROGRESS,
  })
  status?: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
