import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Consultation } from './consultation.entity';

@Entity()
export class Pricing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  planName: string; // e.g., “Standard”, “Premium”

  @Column('decimal', { precision: 8, scale: 2 })
  price: number;

  @OneToMany(() => Consultation, (consultation) => consultation.pricing)
  consultations: Consultation[];
}
