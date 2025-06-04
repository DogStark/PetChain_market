import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { InsurancePolicy } from './insurance-policy.entity';

@Entity('insurance_providers')
export class InsuranceProvider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  code: string;

  @Column()
  apiEndpoint: string;

  @Column()
  apiKey: string;

  @Column({ type: 'json', nullable: true })
  configuration: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => InsurancePolicy, policy => policy.provider)
  policies: InsurancePolicy[];
}
