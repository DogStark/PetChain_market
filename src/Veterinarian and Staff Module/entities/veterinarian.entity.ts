import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Credential } from './credential.entity';
import { AvailabilitySchedule } from './availability-schedule.entity';
import { Specialization } from './specialization.entity';

export enum VeterinarianStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  RETIRED = 'retired'
}

@Entity('veterinarians')
export class Veterinarian {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ type: 'int', default: 0 })
  yearsOfExperience: number;

  @Column({ type: 'enum', enum: VeterinarianStatus, default: VeterinarianStatus.ACTIVE })
  status: VeterinarianStatus;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  emergencyContact: string;

  @Column({ nullable: true })
  emergencyPhone: string;

  @OneToMany(() => Credential, (credential) => credential.veterinarian, { cascade: true })
  credentials: Credential[];

  @OneToMany(() => AvailabilitySchedule, (schedule) => schedule.veterinarian, { cascade: true })
  availabilitySchedules: AvailabilitySchedule[];

  @ManyToMany(() => Specialization, (specialization) => specialization.veterinarians, { cascade: true })
  @JoinTable({
    name: 'veterinarian_specializations',
    joinColumn: { name: 'veterinarianId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'specializationId', referencedColumnName: 'id' }
  })
  specializations: Specialization[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get activeCredentials(): Credential[] {
    return this.credentials?.filter(cred => cred.isActive && new Date(cred.expirationDate) > new Date()) || [];
  }

  get isAvailable(): boolean {
    return this.status === VeterinarianStatus.ACTIVE && this.activeCredentials.length > 0;
  }
}