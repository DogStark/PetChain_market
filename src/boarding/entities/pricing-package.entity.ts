import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { BoardingFacility } from './boarding-facility.entity';
import { Booking } from './booking.entity';

export enum PackageType {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  LUXURY = 'luxury',
}

interface AdditionalService {
  name: string;
  price: number;
  description: string;
  isRequired?: boolean;
}

@Entity('pricing_packages')
export class PricingPackage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  facilityId!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: PackageType,
    default: PackageType.BASIC,
  })
  type!: PackageType;

  @Column({ type: 'decimal', precision: 10, scale: 2, unsigned: true })
  dailyRate!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    unsigned: true,
    nullable: true,
  })
  weeklyRate?: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    unsigned: true,
    nullable: true,
  })
  monthlyRate?: number;

  @Column({ type: 'json' })
  includedServices!: string[];

  @Column({ type: 'json', nullable: true })
  additionalServices?: AdditionalService[];

  @Column({ type: 'int', unsigned: true, nullable: true })
  maxPetSize?: number; // in kg

  @Column({ type: 'json', nullable: true })
  allowedPetTypes?: string[];

  @Column({ type: 'int', unsigned: true, nullable: true })
  minBookingDays?: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  maxBookingDays?: number;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(() => BoardingFacility, facility => facility.packages)
  @JoinColumn({ name: 'facilityId' })
  facility!: BoardingFacility;

  @OneToMany(() => Booking, booking => booking.package)
  bookings?: Booking[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
