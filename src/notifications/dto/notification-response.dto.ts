import type { NotificationStatus, NotificationPriority, NotificationChannel } from "../entities/notification.entity"
import type { TemplateCategory } from "../entities/notification-template.entity"

export class NotificationResponseDto {
  id: string
  user_id: string
  template_id?: string
  channel: NotificationChannel
  status: NotificationStatus
  priority: NotificationPriority
  subject?: string
  content: string
  html_content?: string
  data?: Record<string, any>
  recipient_email?: string
  recipient_phone?: string
  is_read: boolean
  read_at?: Date
  scheduled_for?: Date
  sent_at?: Date
  delivered_at?: Date
  error_message?: string
  retry_count: number
  reference_type?: string
  reference_id?: string
  created_at: Date
  updated_at: Date

  // Related entities
  user?: {
    id: string
    full_name: string
    email: string
  }

  template?: {
    id: string
    name: string
    template_key: string
    category: TemplateCategory
  }
}

export class NotificationStatsDto {
  total_notifications: number
  unread_count: number
  by_status: Record<NotificationStatus, number>
  by_channel: Record<NotificationChannel, number>
  by_priority: Record<NotificationPriority, number>
}

export class NotificationPreferenceResponseDto {
  id: string
  user_id: string
  category: TemplateCategory
  channel: NotificationChannel
  is_enabled: boolean
  settings?: Record<string, any>
  quiet_hours_start?: string
  quiet_hours_end?: string
  frequency?: string
  created_at: Date
  updated_at: Date
}
