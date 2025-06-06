import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from "typeorm"
import { Client } from "./client.entity"
import { Appointment } from "./appointment.entity"

@Entity("pets")
@Index(["owner_id"])
@Index(["name", "owner_id"])
export class Pet {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 100 })
  name: string

  @Column({ type: "varchar", length: 50 })
  species: string // dog, cat, bird, etc.

  @Column({ type: "varchar", length: 50, nullable: true })
  breed: string

  @Column({ type: "varchar", length: 10, nullable: true })
  gender: string // male, female

  @Column({ type: "date", nullable: true })
  date_of_birth: Date

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  weight: number

  @Column({ type: "varchar", length: 50, nullable: true })
  color: string

  @Column({ type: "text", nullable: true })
  medical_notes: string

  @Column({ type: "text", nullable: true })
  allergies: string

  @Column({ type: "boolean", default: true })
  is_active: boolean

  @Column({ type: "uuid" })
  owner_id: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @ManyToOne(
    () => Client,
    (client) => client.pets,
  )
  @JoinColumn({ name: "owner_id" })
  owner: Client

  @OneToMany(
    () => Appointment,
    (appointment) => appointment.pet,
  )
  appointments: Appointment[]
}
