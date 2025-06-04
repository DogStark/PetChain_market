import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { InsuranceProvider } from './insurance-provider.entity';
import { Pet } from '../../pets/pet.entity';
import { InsuranceClaim } from './insurance-claim.entity';

@Entity('insurance_policies')
export class InsurancePolicy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  policyNumber: string;

  @Column()
  holderName: string;

  @Column()
  holderEmail: string;

  @Column()
  holderPhone: string;

  @Column('decimal', { precision: 10, scale: 2 })
  deductible: number;

  @Column('decimal', { precision: 5, scale: 2 })
  coveragePercentage: number;

  @Column('decimal', { precision: 10, scale: 2 })
  annualLimit: number;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date' })
  expirationDate: Date;

  @Column({ type: 'enum', enum: ['active', 'suspended', 'cancelled', 'expired'], default: 'active' })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => InsuranceProvider, provider => provider.policies)
  @JoinColumn({ name: 'provider_id' })
  provider: InsuranceProvider;

  @Column({ name: 'provider_id' })
  providerId: number;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;

  @Column({ name: 'pet_id' })
  petId: number;

  @OneToMany(() => InsuranceClaim, claim => claim.policy)
  claims: InsuranceClaim[];
}
