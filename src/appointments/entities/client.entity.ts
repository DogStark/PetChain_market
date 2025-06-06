import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from "typeorm"
import { Pet } from "./pet.entity"
import { Appointment } from "./appointment.entity"

@Entity("clients")
@Index(["email"], { unique: true })
@Index(["phone"])
export class Client {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 100 })
  first_name: string

  @Column({ type: "varchar", length: 100 })
  last_name: string

  @Column({ type: "varchar", length: 255, unique: true })
  email: string

  @Column({ type: "varchar", length: 20 })
  phone: string

  @Column({ type: "text", nullable: true })
  address: string

  @Column({ type: "date", nullable: true })
  date_of_birth: Date

  @Column({ type: "boolean", default: true })
  is_active: boolean

  @Column({ type: "text", nullable: true })
  notes: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @OneToMany(
    () => Pet,
    (pet) => pet.owner,
  )
  pets: Pet[]

  @OneToMany(
    () => Appointment,
    (appointment) => appointment.client,
  )
  appointments: Appointment[]

  get full_name(): string {
    return `${this.first_name} ${this.last_name}`
  }
}
