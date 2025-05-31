import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Customer } from "./customer-pet.entity"

export enum AddressType {
  HOME = "HOME",
  WORK = "WORK",
  BILLING = "BILLING",
  SHIPPING = "SHIPPING",
  OTHER = "OTHER",
}

@Entity("customer_addresses")
export class Address {
@PrimaryGeneratedColumn("uuid")
id!: string

  @Column("uuid")
  customerId!: string

  @ManyToOne(
    () => Customer,
    (customer) => customer.addresses,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "customerId" })
  customer!: Customer

  @Column({
    type: "enum",
    enum: AddressType,
    default: AddressType.HOME,
  })
  type!: AddressType

  @Column({ length: 255 })
  street!: string

  @Column({ length: 100 })
  city!: string

  @Column({ length: 100 })
  state!: string

  @Column({ length: 20 })
  postalCode!: string

  @Column({ length: 100 })
  country!: string

  @Column({ default: false })
  isPrimary!: boolean

  @Column({ default: true })
  isActive!: boolean

  @Column({ type: "decimal", precision: 10, scale: 8, nullable: true })
  latitude!: number

  @Column({ type: "decimal", precision: 11, scale: 8, nullable: true })
  longitude!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  get fullAddress(): string {
    return `${this.street}, ${this.city}, ${this.state} ${this.postalCode}, ${this.country}`
  }
}
