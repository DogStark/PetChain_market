import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Pet } from '../../pets/entities/pet.entity';

@Entity('vaccination_records')
export class VaccinationRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pet, pet => pet.vaccinationRecords)
  pet: Pet;

  @Column()
  petId: string;

  @Column()
  vaccineName: string;

  @Column()
  vaccineType: string;

  @Column()
  manufacturer: string;

  @Column()
  batchNumber: string;

  @Column('date')
  administeredDate: Date;

  @Column('date', { nullable: true })
  nextDueDate: Date;

  @Column()
  veterinarianName: string;

  @Column()
  clinicName: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('json', { nullable: true })
  sideEffects: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
