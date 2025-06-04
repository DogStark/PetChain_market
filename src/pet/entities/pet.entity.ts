import { Activity } from '@/activity/entities/activity.entity';
import { Photo } from '@/boarding/entities/photo.entity';
import { MedicalHistory } from '@/medical/entities/medical.entity';
import { Prescription } from '@/prescription/entities/prescription.entity';
import { User } from '@/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column({ type: 'date' })
  birthDate: Date;

  @Column()
  gender: string;

  @Column({ nullable: true })
  weight: number;

  @Column({ nullable: true })
  color: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, user => user.ownedPets)
  owner: User;

  @Column()
  ownerId: string;

  @ManyToMany(() => User, user => user.sharedPets)
  @JoinTable({
    name: 'pet_family_members',
    joinColumn: { name: 'petId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  familyMembers: User[];

  @OneToMany(() => MedicalHistory, medicalHistory => medicalHistory.pet)
  medicalHistory: MedicalHistory[];

  @OneToMany(() => Photo, photo => photo.pet)
  photos: Photo[];

  @OneToMany(() => Activity, activity => activity.pet)
  activities: Activity[];
  
  @OneToMany(() => Prescription, prescription => prescription.pet)
  prescriptions: Prescription[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
