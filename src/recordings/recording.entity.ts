import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Consultation } from '../consultations/consultation.entity';

@Entity()
export class Recording {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileUrl: string; // where the recorded file is stored

  @OneToMany(() => Consultation, (consult) => consult.recording)
  consultations: Consultation[];

  @CreateDateColumn()
  createdAt: Date;
}
