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
import { NotificationChannel, TemplateCategory } from "./notification-template.entity"

@Entity("notification_preferences")
@Index(["user_id", "category", "channel"], { unique: true })
@Index(["user_id"])
export class NotificationPreference {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  user_id: string

  @Column({
    type: "enum",
    enum: TemplateCategory,
  })
  category: TemplateCategory

  @Column({
    type: "enum",
    enum: NotificationChannel,
  })
  channel: NotificationChannel

  @Column({ type: "boolean", default: true })
  is_enabled: boolean

  @Column({ type: "json", nullable: true })
  settings: Record<string, any> // Channel-specific settings

  @Column({ type: "time", nullable: true })
  quiet_hours_start: string // e.g., "22:00"

  @Column({ type: "time", nullable: true })
  quiet_hours_end: string // e.g., "08:00"

  @Column({ type: "varchar", length: 50, nullable: true })
  frequency: string // immediate, daily, weekly

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @ManyToOne(
    () => User,
    (user) => user.notification_preferences,
  )
  @JoinColumn({ name: "user_id" })
  user: User
}
