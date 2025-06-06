import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from "typeorm"
import { Notification } from "./notification.entity"

export enum NotificationChannel {
  EMAIL = "email",
  SMS = "sms",
  IN_APP = "in_app",
  PUSH = "push",
}

export enum TemplateCategory {
  APPOINTMENT = "appointment",
  REMINDER = "reminder",
  MARKETING = "marketing",
  SYSTEM = "system",
  BILLING = "billing",
  SECURITY = "security",
}

@Entity("notification_templates")
@Index(["template_key"], { unique: true })
@Index(["category"])
@Index(["channel"])
@Index(["is_active"])
export class NotificationTemplate {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 100, unique: true })
  template_key: string // e.g., "appointment_reminder", "welcome_email"

  @Column({ type: "varchar", length: 255 })
  name: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({
    type: "enum",
    enum: NotificationChannel,
  })
  channel: NotificationChannel

  @Column({
    type: "enum",
    enum: TemplateCategory,
  })
  category: TemplateCategory

  @Column({ type: "varchar", length: 255, nullable: true })
  subject: string // For email templates

  @Column({ type: "text" })
  content: string // Template content with variables

  @Column({ type: "text", nullable: true })
  html_content: string // HTML version for emails

  @Column({ type: "json", nullable: true })
  variables: Record<string, any> // Available template variables

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any> // Additional template metadata

  @Column({ type: "varchar", length: 10, default: "en" })
  language: string

  @Column({ type: "boolean", default: true })
  is_active: boolean

  @Column({ type: "int", default: 1 })
  version: number

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @OneToMany(
    () => Notification,
    (notification) => notification.template,
  )
  notifications: Notification[]
}
