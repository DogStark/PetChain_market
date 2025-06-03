import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Owner } from './owner.entity';

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  species: string;

  @Column({ length: 100, nullable: true })
  breed?: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ 
    type: 'enum',
    enum: ['male', 'female', 'unknown'],
    default: 'unknown'
  })
  gender: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number;

  @Column({ nullable: true })
  photoUrl?: string;

  @Column()
  ownerId: number;

  @ManyToOne(() => Owner, owner => owner.pets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: Owner;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
