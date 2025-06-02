import { Pet } from '@/pet/entities/pet.entity';
import { User } from '@/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column()
  url: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'text', nullable: true })
  caption: string;

  @Column({ default: false })
  isProfilePhoto: boolean;

  @ManyToOne(() => Pet, pet => pet.photos)
  pet: Pet;

  @Column()
  petId: string;

  @ManyToOne(() => User)
  uploadedBy: User;

  @Column()
  uploadedById: string;

  @CreateDateColumn()
  createdAt: Date;
}
