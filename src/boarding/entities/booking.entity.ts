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
import { Pet } from '../../pets/entities/pet.entity';
import { User } from '../../users/entities/user.entity';
import { BoardingFacility } from './boarding-facility.entity';
import { PricingPackage } from './pricing-package.entity';
import { Activity } from './activity.entity';
import { Photo } from './photo.entity';

export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CHECKED_IN = 'checked_in',
    CHECKED_OUT = 'checked_out',
    CANCELLED = 'cancelled',
}

@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    petId!: string;

    @Column()
    ownerId!: string;

    @Column()
    facilityId!: string;

    @Column()
    packageId!: string;

    @Column({ type: 'date' })
    startDate!: Date;

    @Column({ type: 'date' })
    endDate!: Date;

    @Column({ type: 'timestamp', nullable: true })
    checkInTime?: Date;

    @Column({ type: 'timestamp', nullable: true })
    checkOutTime?: Date;

    @Column({
        type: 'enum',
        enum: BookingStatus,
        default: BookingStatus.PENDING,
    })
    status!: BookingStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalPrice!: number;

    @Column({ type: 'text', nullable: true })
    specialInstructions?: string;

    @Column({ type: 'text', nullable: true })
    emergencyContact?: string;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @ManyToOne(() => Pet, { eager: true })
    @JoinColumn({ name: 'petId' })
    pet!: Pet;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'ownerId' })
    owner!: User;

    @ManyToOne(() => BoardingFacility, { eager: true })
    @JoinColumn({ name: 'facilityId' })
    facility!: BoardingFacility;

    @ManyToOne(() => PricingPackage, { eager: true })
    @JoinColumn({ name: 'packageId' })
    package!: PricingPackage;

    @OneToMany(() => Activity, (activity) => activity.booking)
    activities?: Activity[];

    @OneToMany(() => Photo, (photo) => photo.booking)
    photos?: Photo[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
  }