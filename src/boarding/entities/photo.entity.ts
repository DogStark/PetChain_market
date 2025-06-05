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

export enum PhotoType {
  DAILY_UPDATE = 'daily_update',
  ACTIVITY = 'activity',
  MEAL_TIME = 'meal_time',
  PLAY_TIME = 'play_time',
  SLEEPING = 'sleeping',
  GROOMING = 'grooming',
  CHECK_IN = 'check_in',
  CHECK_OUT = 'check_out',
  MEDICAL = 'medical',
  OTHER = 'other',
}

interface PhotoMetadata {
  size?: number;
  mimeType?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  location?: string;
  tags?: string[];
}

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  bookingId!: string;

  @Column()
  uploadedById!: string;

  @Column({ type: 'text' })
  url!: string;

  @Column({ length: 255 })
  filename!: string;

  @Column({
    type: 'enum',
    enum: PhotoType,
    default: PhotoType.DAILY_UPDATE,
  })
  type!: PhotoType;

  @Column()
  petId!: string;

  @ManyToOne(() => Pet, pet => pet.photos)
  @JoinColumn({ name: 'petId' })
  pet!: Pet;

  @Column({ type: 'text', nullable: true })
  caption?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: PhotoMetadata;

  @Column({ default: true })
  isVisible!: boolean;

  @Column({ default: false })
  isFavorite!: boolean;

  @ManyToOne(() => Booking, booking => booking.photos)
  @JoinColumn({ name: 'bookingId' })
  booking!: Booking;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
