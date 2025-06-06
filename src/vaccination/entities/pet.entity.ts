import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { VaccinationRecord } from '../../vaccination/entities/vaccination-record.entity';
import { VaccinationSchedule } from '../../vaccination/entities/vaccination-schedule.entity';

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  species: string;

  @Column()
  breed: string;

  @Column('date')
  dateOfBirth: Date;

  @Column()
  ownerId: string;

  @OneToMany(() => VaccinationRecord, record => record.pet)
  vaccinationRecords: VaccinationRecord[];

  @OneToMany(() => VaccinationSchedule, schedule => schedule.pet)
  vaccinationSchedules: VaccinationSchedule[];

  @CreateDateColumn()
  createdAt: Date;
}
