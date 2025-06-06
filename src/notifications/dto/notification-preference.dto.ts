import { IsUUID, IsEnum, IsBoolean, IsOptional, IsObject, IsString } from "class-validator"
import { NotificationChannel, TemplateCategory } from "../entities/notification-template.entity"

export class UpdateNotificationPreferenceDto {
  @IsUUID()
  user_id: string

  @IsEnum(TemplateCategory)
  category: TemplateCategory

  @IsEnum(NotificationChannel)
  channel: NotificationChannel

  @IsBoolean()
  is_enabled: boolean

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>

  @IsOptional()
  @IsString()
  quiet_hours_start?: string

  @IsOptional()
  @IsString()
  quiet_hours_end?: string

  @IsOptional()
  @IsString()
  frequency?: string
}

export class BulkUpdatePreferencesDto {
  @IsUUID()
  user_id: string

  preferences: Array<{
    category: TemplateCategory
    channel: NotificationChannel
    is_enabled: boolean
    settings?: Record<string, any>
  }>
}
