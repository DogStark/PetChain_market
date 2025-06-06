import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('vaccination_templates')
export class VaccinationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  species: string; 

  @Column('json')
  vaccinations: VaccinationScheduleItem[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export interface VaccinationScheduleItem {
  vaccineName: string;
  vaccineType: string;
  ageInWeeks: number;
  intervalWeeks?: number;
  boosterRequired: boolean;
  isMandatory: boolean;
}
