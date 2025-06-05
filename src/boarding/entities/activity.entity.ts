import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Booking } from './booking.entity';
import { User } from '../../user/entities/user.entity';
import { Pet } from '../../customer-pet/entities/pet.entity';

export enum ActivityType {
  FEEDING = 'feeding',
  WALKING = 'walking',
  PLAYTIME = 'playtime',
  GROOMING = 'grooming',
  MEDICATION = 'medication',
  VETERINARY = 'veterinary',
  EXERCISE = 'exercise',
  SOCIALIZATION = 'socialization',
  REST = 'rest',
  TRAINING = 'training',
  OTHER = 'other',
}

interface ActivityMetadata {
  foodAmount?: string;
  walkDistance?: number;
  medicationGiven?: string;
  mood?: 'happy' | 'calm' | 'anxious' | 'playful' | 'tired';
  energyLevel?: 'low' | 'medium' | 'high';
  notes?: string;
  temperature?: number;
  weight?: number;
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  bookingId!: string;

  @Column()
  staffId!: string;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  type!: ActivityType;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'timestamp' })
  activityTime!: Date;

  @Column({ type: 'int', unsigned: true, nullable: true })
  duration?: number; // in minutes

  @Column({ type: 'json', nullable: true })
  metadata?: ActivityMetadata;

  @Column({ type: 'json', nullable: true })
  photoUrls?: string[];

  @Column()
  petId!: string;

  @ManyToOne(() => Pet, pet => pet.activities)
  @JoinColumn({ name: 'petId' })
  pet!: Pet;

  @Column({ default: true })
  isVisible!: boolean;

  @ManyToOne(() => Booking, booking => booking.activities)
  @JoinColumn({ name: 'bookingId' })
  booking!: Booking;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'staffId' })
  staff!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
