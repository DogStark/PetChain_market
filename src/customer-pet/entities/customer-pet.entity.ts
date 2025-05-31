import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Address } from "./address.entity"
import { Pet } from "./pet.entity"

export enum CustomerStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum CustomerType {
  INDIVIDUAL = "INDIVIDUAL",
  BUSINESS = "BUSINESS",
}

@Entity("customers")
export class Customer {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ length: 100 })
  firstName!: string

  @Column({ length: 100 })
  lastName!: string

  @Column({ unique: true, length: 255 })
  email!: string

  @Column({ length: 20, nullable: true })
  phoneNumber!: string

  @Column({ type: "date", nullable: true })
  dateOfBirth!: Date

  @Column({
    type: "enum",
    enum: CustomerType,
    default: CustomerType.INDIVIDUAL,
  })
  customerType!: CustomerType

  @Column({
    type: "enum",
    enum: CustomerStatus,
    default: CustomerStatus.ACTIVE,
  })
  status!: CustomerStatus

  @Column({ length: 500, nullable: true })
  notes!: string

  @Column({ default: false })
  isEmailVerified!: boolean

  @Column({ default: false })
  isPhoneVerified!: boolean

  @Column({ type: "timestamp", nullable: true })
  lastLoginAt!: Date

  @Column({ length: 255, nullable: true })
  emergencyContactName!: string

  @Column({ length: 20, nullable: true })
  emergencyContactPhone!: string

  @Column({ length: 100, nullable: true })
  emergencyContactRelation!: string

// Relationships
@OneToMany(
  () => Pet,
  (pet) => pet.customer,
)
pets!: Pet[]

  @OneToMany(
    () => Address,
    (address) => address.customer,
  )
  addresses!: Address[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  // Computed properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  get primaryAddress(): Address | undefined {
    return this.addresses?.find((addr) => addr.isPrimary)
  }

  get activePetsCount(): number {
    return this.pets?.filter((pet) => pet.isActive).length || 0
  }
}
