import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer-pet.entity';
import { Photo } from '../../boarding/entities/photo.entity';
import { Activity } from '@/boarding/entities/activity.entity';
import { MedicalHistory } from '@/medical/entities/medical.entity';
import { Prescription } from '@/prescription/entities/prescription.entity';
import { User } from '../../user/entities/user.entity';

export enum PetGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  UNKNOWN = 'UNKNOWN',
}

export enum PetStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DECEASED = 'DECEASED',
}

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  customerId!: string;

  @ManyToOne(() => Customer, customer => customer.pets)
  @JoinColumn({ name: 'customerId' })
  customer!: Customer;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 50 })
  species!: string;

  @Column({ length: 100, nullable: true })
  breed!: string;

  @Column({
    type: 'enum',
    enum: PetGender,
    default: PetGender.UNKNOWN,
  })
  gender!: PetGender;

  @Column({ type: 'date', nullable: true })
  dateOfBirth!: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight!: number;

  @Column({ length: 50, nullable: true })
  color!: string;

  @Column({ length: 100, nullable: true })
  microchipNumber!: string;

  @Column({
    type: 'enum',
    enum: PetStatus,
    default: PetStatus.ACTIVE,
  })
  status!: PetStatus;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ length: 500, nullable: true })
  notes!: string;

  @ManyToOne(() => User, user => user.ownedPets)
  owner: User;

  @ManyToMany(() => User, user => user.sharedPets)
  @JoinTable({
    name: 'pet_family_members',
    joinColumn: { name: 'petId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  familyMembers: User[];

  @Column({ length: 255, nullable: true })
  photoUrl!: string;

  @Column({ type: 'json', nullable: true })
  medicalConditions!: string[];

  @Column({ type: 'json', nullable: true })
  allergies!: string[];

  @OneToMany(() => Photo, photo => photo.pet)
  photos: Photo[];

  @OneToMany(() => Activity, activity => activity.pet)
  activities: Activity[];

  @OneToMany(() => MedicalHistory, medicalHistory => medicalHistory.pet)
  medicalHistory: MedicalHistory[];

  @OneToMany(() => Prescription, prescription => prescription.pet)
  prescriptions: Prescription[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  get age(): number | null {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}
