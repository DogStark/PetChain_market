import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Pricing } from './pricing.entity';
import { Recording } from '../recordings/recording.entity';

@Entity()
export class Consultation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientName: string;

  @Column()
  doctorName: string;

  @Column('timestamp')
  scheduledAt: Date;

  @ManyToOne(() => Pricing, (pricing) => pricing.consultations, {
    eager: true,
  })
  pricing: Pricing;

  @ManyToOne(() => Recording, (recording) => recording.consultations, {
    nullable: true,
    eager: true,
  })
  recording: Recording;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  completed: boolean;
}
