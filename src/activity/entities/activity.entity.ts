import { Pet } from '@/pet/entities/pet.entity';
import { User } from '@/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string; // walk, feed, play, grooming, training, etc.

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  duration: number; // in minutes

  @Column({ type: 'timestamp' })
  activityDate: Date;

  @Column({ type: 'json', nullable: true })
  metadata: any; // distance for walks, food type for feeding, etc.

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Pet, pet => pet.activities)
  pet: Pet;

  @Column()
  petId: string;

  @ManyToOne(() => User)
  recordedBy: User;

  @Column()
  recordedById: string;

  @CreateDateColumn()
  createdAt: Date;
}
