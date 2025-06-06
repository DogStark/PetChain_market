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
import { Veterinarian } from "./veterinarian.entity"
import { Client } from "./client.entity"
import { Pet } from "./pet.entity"
import { AppointmentReminder } from "./appointment-reminder.entity"

export enum AppointmentStatus {
  SCHEDULED = "scheduled",
  CONFIRMED = "confirmed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show",
  RESCHEDULED = "rescheduled",
}

export enum AppointmentType {
  CHECKUP = "checkup",
  VACCINATION = "vaccination",
  SURGERY = "surgery",
  EMERGENCY = "emergency",
  CONSULTATION = "consultation",
  FOLLOW_UP = "follow_up",
  GROOMING = "grooming",
}

@Entity("appointments")
@Index(["veterinarian_id", "appointment_date", "start_time"]) // Prevent double booking
@Index(["client_id"])
@Index(["pet_id"])
@Index(["appointment_date"])
@Index(["status"])
@Index(["appointment_date", "status"]) // For daily schedules
export class Appointment {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  veterinarian_id: string

  @Column({ type: "uuid" })
  client_id: string

  @Column({ type: "uuid" })
  pet_id: string

  @Column({ type: "date" })
  appointment_date: Date

  @Column({ type: "time" })
  start_time: string

  @Column({ type: "time" })
  end_time: string

  @Column({ type: "int", default: 30 })
  duration_minutes: number

  @Column({
    type: "enum",
    enum: AppointmentType,
    default: AppointmentType.CHECKUP,
  })
  appointment_type: AppointmentType

  @Column({
    type: "enum",
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus

  @Column({ type: "text", nullable: true })
  reason: string

  @Column({ type: "text", nullable: true })
  notes: string

  @Column({ type: "text", nullable: true })
  veterinarian_notes: string

  @Column({ type: "decimal", precision: 8, scale: 2, nullable: true })
  estimated_cost: number

  @Column({ type: "decimal", precision: 8, scale: 2, nullable: true })
  actual_cost: number

  @Column({ type: "boolean", default: false })
  is_emergency: boolean

  @Column({ type: "varchar", length: 50, default: "walk_in" })
  booking_source: string // online, phone, walk_in

  @Column({ type: "timestamp", nullable: true })
  confirmed_at: Date

  @Column({ type: "timestamp", nullable: true })
  cancelled_at: Date

  @Column({ type: "text", nullable: true })
  cancellation_reason: string

  @Column({ type: "uuid", nullable: true })
  rescheduled_from_id: string // Reference to original appointment if rescheduled

  @Column({ type: "uuid", nullable: true })
  rescheduled_to_id: string // Reference to new appointment if rescheduled

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @ManyToOne(
    () => Veterinarian,
    (veterinarian) => veterinarian.appointments,
  )
  @JoinColumn({ name: "veterinarian_id" })
  veterinarian: Veterinarian

  @ManyToOne(
    () => Client,
    (client) => client.appointments,
  )
  @JoinColumn({ name: "client_id" })
  client: Client

  @ManyToOne(
    () => Pet,
    (pet) => pet.appointments,
  )
  @JoinColumn({ name: "pet_id" })
  pet: Pet

  @OneToMany(
    () => AppointmentReminder,
    (reminder) => reminder.appointment,
  )
  reminders: AppointmentReminder[]

  get appointment_datetime(): Date {
    const [hours, minutes] = this.start_time.split(":").map(Number)
    const datetime = new Date(this.appointment_date)
    datetime.setHours(hours, minutes, 0, 0)
    return datetime
  }

  get is_past(): boolean {
    return this.appointment_datetime < new Date()
  }

  get is_today(): boolean {
    const today = new Date()
    const appointmentDate = new Date(this.appointment_date)
    return (
      appointmentDate.getDate() === today.getDate() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getFullYear() === today.getFullYear()
    )
  }
}
