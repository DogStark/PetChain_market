import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Pet } from './pet.entity';

@Entity('owners')
export class Owner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 150, unique: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @OneToMany(() => Pet, pet => pet.owner)
  pets: Pet[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
