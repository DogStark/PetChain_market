import {
  IsUUID,
  IsEnum,
  IsString,
  IsOptional,
  IsObject,
  IsDateString,
  IsEmail,
  IsPhoneNumber,
  Length,
} from "class-validator"
import { NotificationChannel, NotificationPriority } from "../entities/notification.entity"

export class CreateNotificationDto {
  @IsUUID()
  user_id: string

  @IsOptional()
  @IsUUID()
  template_id?: string

  @IsEnum(NotificationChannel)
  channel: NotificationChannel

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority = NotificationPriority.NORMAL

  @IsOptional()
  @IsString()
  @Length(1, 255)
  subject?: string

  @IsString()
  @Length(1, 5000)
  content: string

  @IsOptional()
  @IsString()
  html_content?: string

  @IsOptional()
  @IsObject()
  data?: Record<string, any>

  @IsOptional()
  @IsObject()
  variables?: Record<string, any>

  @IsOptional()
  @IsEmail()
  recipient_email?: string

  @IsOptional()
  @IsPhoneNumber()
  recipient_phone?: string

  @IsOptional()
  @IsDateString()
  scheduled_for?: string

  @IsOptional()
  @IsString()
  reference_type?: string

  @IsOptional()
  @IsString()
  reference_id?: string
}
