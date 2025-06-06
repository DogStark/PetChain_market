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
import { User } from "./user.entity"
import { NotificationTemplate, NotificationChannel } from "./notification-template.entity"

export enum NotificationStatus {
  PENDING = "pending",
  SENT = "sent",
  DELIVERED = "delivered",
  FAILED = "failed",
  CANCELLED = "cancelled",
  READ = "read",
}

export enum NotificationPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

@Entity("notifications")
@Index(["user_id"])
@Index(["template_id"])
@Index(["channel"])
@Index(["status"])
@Index(["priority"])
@Index(["scheduled_for"])
@Index(["user_id", "status"])
@Index(["user_id", "is_read"])
@Index(["created_at"])
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  user_id: string

  @Column({ type: "uuid", nullable: true })
  template_id: string

  @Column({
    type: "enum",
    enum: NotificationChannel,
  })
  channel: NotificationChannel

  @Column({
    type: "enum",
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus

  @Column({
    type: "enum",
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority

  @Column({ type: "varchar", length: 255, nullable: true })
  subject: string

  @Column({ type: "text" })
  content: string

  @Column({ type: "text", nullable: true })
  html_content: string

  @Column({ type: "json", nullable: true })
  data: Record<string, any> // Additional data for the notification

  @Column({ type: "json", nullable: true })
  variables: Record<string, any> // Template variables used

  @Column({ type: "varchar", length: 255, nullable: true })
  recipient_email: string

  @Column({ type: "varchar", length: 20, nullable: true })
  recipient_phone: string

  @Column({ type: "boolean", default: false })
  is_read: boolean

  @Column({ type: "timestamp", nullable: true })
  read_at: Date

  @Column({ type: "timestamp", nullable: true })
  scheduled_for: Date

  @Column({ type: "timestamp", nullable: true })
  sent_at: Date

  @Column({ type: "timestamp", nullable: true })
  delivered_at: Date

  @Column({ type: "text", nullable: true })
  error_message: string

  @Column({ type: "int", default: 0 })
  retry_count: number

  @Column({ type: "int", default: 3 })
  max_retries: number

  @Column({ type: "varchar", length: 255, nullable: true })
  external_id: string // ID from external service (SendGrid, Twilio, etc.)

  @Column({ type: "json", nullable: true })
  delivery_info: Record<string, any> // Delivery tracking info

  @Column({ type: "varchar", length: 100, nullable: true })
  reference_type: string // e.g., "appointment", "order"

  @Column({ type: "varchar", length: 255, nullable: true })
  reference_id: string // ID of the referenced entity

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @ManyToOne(
    () => User,
    (user) => user.notifications,
  )
  @JoinColumn({ name: "user_id" })
  user: User

  @ManyToOne(
    () => NotificationTemplate,
    (template) => template.notifications,
  )
  @JoinColumn({ name: "template_id" })
  template: NotificationTemplate

  get is_scheduled(): boolean {
    return this.scheduled_for && this.scheduled_for > new Date()
  }

  get is_overdue(): boolean {
    return this.scheduled_for && this.scheduled_for < new Date() && this.status === NotificationStatus.PENDING
  }
}
