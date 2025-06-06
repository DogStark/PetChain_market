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
import { Veterinarian } from "./veterinarian.entity"

export enum DayOfWeek {
  MONDAY = 0,
  TUESDAY = 1,
  WEDNESDAY = 2,
  THURSDAY = 3,
  FRIDAY = 4,
  SATURDAY = 5,
  SUNDAY = 6,
}

@Entity("veterinarian_availability")
@Index(["veterinarian_id", "day_of_week"])
@Index(["veterinarian_id", "is_active"])
export class VeterinarianAvailability {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  veterinarian_id: string

  @Column({ type: "int" })
  day_of_week: DayOfWeek // 0 = Monday, 6 = Sunday

  @Column({ type: "time" })
  start_time: string

  @Column({ type: "time" })
  end_time: string

  @Column({ type: "int", default: 30 })
  slot_duration_minutes: number

  @Column({ type: "boolean", default: true })
  is_active: boolean

  @Column({ type: "date", nullable: true })
  effective_from: Date

  @Column({ type: "date", nullable: true })
  effective_until: Date

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @ManyToOne(
    () => Veterinarian,
    (veterinarian) => veterinarian.availability_schedules,
  )
  @JoinColumn({ name: "veterinarian_id" })
  veterinarian: Veterinarian
}
