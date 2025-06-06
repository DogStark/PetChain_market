import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { Appointment } from "./appointment.entity"

export enum ReminderType {
  EMAIL = "email",
  SMS = "sms",
  PUSH = "push_notification",
}

export enum ReminderStatus {
  PENDING = "pending",
  SENT = "sent",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

@Entity("appointment_reminders")
@Index(["appointment_id"])
@Index(["scheduled_for", "status"])
@Index(["reminder_type", "status"])
export class AppointmentReminder {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  appointment_id: string

  @Column({
    type: "enum",
    enum: ReminderType,
    default: ReminderType.EMAIL,
  })
  reminder_type: ReminderType

  @Column({ type: "timestamp" })
  scheduled_for: Date

  @Column({
    type: "enum",
    enum: ReminderStatus,
    default: ReminderStatus.PENDING,
  })
  status: ReminderStatus

  @Column({ type: "text", nullable: true })
  message: string

  @Column({ type: "timestamp", nullable: true })
  sent_at: Date

  @Column({ type: "text", nullable: true })
  error_message: string

  @Column({ type: "int", default: 0 })
  retry_count: number

  @Column({ type: "int", default: 3 })
  max_retries: number

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @ManyToOne(
    () => Appointment,
    (appointment) => appointment.reminders,
  )
  @JoinColumn({ name: "appointment_id" })
  appointment: Appointment
}
