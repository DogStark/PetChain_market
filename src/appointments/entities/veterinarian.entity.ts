import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from "typeorm"
import { Appointment } from "./appointment.entity"
import { VeterinarianAvailability } from "./veterinarian-availability.entity"

@Entity("veterinarians")
@Index(["email"], { unique: true })
@Index(["license_number"], { unique: true })
export class Veterinarian {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 100 })
  first_name: string

  @Column({ type: "varchar", length: 100 })
  last_name: string

  @Column({ type: "varchar", length: 255, unique: true })
  email: string

  @Column({ type: "varchar", length: 20, nullable: true })
  phone: string

  @Column({ type: "varchar", length: 100, unique: true })
  license_number: string

  @Column({ type: "varchar", length: 100, nullable: true })
  specialization: string

  @Column({ type: "text", nullable: true })
  bio: string

  @Column({ type: "decimal", precision: 3, scale: 2, default: 0 })
  rating: number

  @Column({ type: "int", default: 0 })
  total_appointments: number

  @Column({ type: "boolean", default: true })
  is_active: boolean

  @Column({ type: "varchar", length: 50, default: "available" })
  status: string // available, busy, on_leave, inactive

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @OneToMany(
    () => Appointment,
    (appointment) => appointment.veterinarian,
  )
  appointments: Appointment[]

  @OneToMany(
    () => VeterinarianAvailability,
    (availability) => availability.veterinarian,
  )
  availability_schedules: VeterinarianAvailability[]

  get full_name(): string {
    return `${this.first_name} ${this.last_name}`
  }
}
