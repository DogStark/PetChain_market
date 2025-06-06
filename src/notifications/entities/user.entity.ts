import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from "typeorm"
import { Notification } from "./notification.entity"
import { NotificationPreference } from "./notification-preference.entity"

@Entity("users")
@Index(["email"], { unique: true })
@Index(["phone"])
export class User {
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

  @Column({ type: "varchar", length: 50, default: "active" })
  status: string // active, inactive, suspended

  @Column({ type: "varchar", length: 10, default: "en" })
  preferred_language: string

  @Column({ type: "varchar", length: 50, nullable: true })
  timezone: string

  @Column({ type: "boolean", default: true })
  is_active: boolean

  @Column({ type: "timestamp", nullable: true })
  last_login_at: Date

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @OneToMany(
    () => Notification,
    (notification) => notification.user,
  )
  notifications: Notification[]

  @OneToMany(
    () => NotificationPreference,
    (preference) => preference.user,
  )
  notification_preferences: NotificationPreference[]

  get full_name(): string {
    return `${this.first_name} ${this.last_name}`
  }
}
