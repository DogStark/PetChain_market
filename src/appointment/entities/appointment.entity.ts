import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn
} from 'typeorm';
import { Location } from '@/location/entities/location.entity';

@Entity()
export class Appointment {
@PrimaryGeneratedColumn()
id: number = 0;

@Column()
patientName: string = '';

@Column()
serviceType: string = '';

@Column({ type: 'timestamp' })
scheduledAt: Date = new Date();


     @ManyToOne(() => Location, location => location.appointments, { eager: true })
     location: Location = new Location;

@CreateDateColumn()
createdAt: Date = new Date();
}

