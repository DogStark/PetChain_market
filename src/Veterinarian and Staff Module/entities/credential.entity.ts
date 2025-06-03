import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Veterinarian } from './veterinarian.entity';

export enum CredentialType {
  LICENSE = 'license',
  CERTIFICATION = 'certification',
  DEGREE = 'degree',
  CONTINUING_EDUCATION = 'continuing_education'
}

@Entity('credentials')
export class Credential {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: CredentialType })
  type: CredentialType;

  @Column()
  issuingAuthority: string;

  @Column({ unique: true })
  licenseNumber: string;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date' })
  expirationDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Veterinarian, (vet) => vet.credentials, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'veterinarianId' })
  veterinarian: Veterinarian;

  @Column()
  veterinarianId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}