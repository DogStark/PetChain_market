import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Booking } from './booking.entity';
import { PricingPackage } from './pricing-package.entity';

interface OperatingHours {
  [key: string]: {
    open: string;
    close: string;
    isClosed?: boolean;
  };
}

@Entity('boarding_facilities')
export class BoardingFacility {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ length: 20 })
  phone!: string;

  @Column({ length: 255 })
  email!: string;

  @Column({ type: 'int', unsigned: true })
  capacity!: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  currentOccupancy!: number;

  @Column({ type: 'json', nullable: true })
  amenities?: string[];

  @Column({ type: 'json', nullable: true })
  operatingHours?: OperatingHours;

  @Column({ type: 'text', nullable: true })
  website?: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude?: number;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => Booking, booking => booking.facility)
  bookings?: Booking[];

  @OneToMany(() => PricingPackage, package_ => package_.facility)
  packages?: PricingPackage[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
