import { IsUUID, IsEnum, IsString, IsOptional, IsObject, IsDateString, IsArray } from "class-validator"
import { NotificationChannel, NotificationPriority } from "../entities/notification.entity"

export class SendTemplateNotificationDto {
  @IsString()
  template_key: string

  @IsUUID()
  user_id: string

  @IsEnum(NotificationChannel)
  channel: NotificationChannel

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority = NotificationPriority.NORMAL

  @IsObject()
  variables: Record<string, any>

  @IsOptional()
  @IsObject()
  data?: Record<string, any>

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

export class BulkSendTemplateNotificationDto {
  @IsString()
  template_key: string

  @IsArray()
  @IsUUID(undefined, { each: true })
  user_ids: string[]

  @IsEnum(NotificationChannel)
  channel: NotificationChannel

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority = NotificationPriority.NORMAL

  @IsObject()
  variables: Record<string, any>

  @IsOptional()
  @IsObject()
  data?: Record<string, any>

  @IsOptional()
  @IsDateString()
  scheduled_for?: string

  @IsOptional()
  @IsString()
  reference_type?: string
}
