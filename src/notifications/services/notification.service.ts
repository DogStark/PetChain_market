import { Injectable, Logger, NotFoundException, BadRequestException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { LessThanOrEqual, MoreThan, LessThan } from "typeorm"
import { Cron, CronExpression } from "@nestjs/schedule"
import { type Notification, NotificationStatus, NotificationChannel } from "../entities/notification.entity"
import type { User } from "../entities/user.entity"
import type { NotificationPreference } from "../entities/notification-preference.entity"
import type { CreateNotificationDto } from "../dto/create-notification.dto"
import type {
  SendTemplateNotificationDto,
  BulkSendTemplateNotificationDto,
} from "../dto/send-template-notification.dto"
import type { NotificationResponseDto, NotificationStatsDto } from "../dto/notification-response.dto"
import type { TemplateService } from "./template.service"
import type { EmailService } from "./email.service"
import type { SmsService } from "./sms.service"

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)

  constructor(
    private readonly notificationRepository: Repository<Notification>,
    private readonly userRepository: Repository<User>,
    private readonly preferenceRepository: Repository<NotificationPreference>,
    private readonly preferenceRepository: Repository<NotificationPreference>,
    private readonly templateService: TemplateService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  async createNotification(createDto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const startTime = Date.now()

    try {
      // Validate user exists
      const user = await this.userRepository.findOne({
        where: { id: createDto.user_id, is_active: true },
      })

      if (!user) {
        throw new NotFoundException("User not found or inactive")
      }

      // Set recipient info if not provided
      if (!createDto.recipient_email && createDto.channel === NotificationChannel.EMAIL) {
        createDto.recipient_email = user.email
      }
      if (!createDto.recipient_phone && createDto.channel === NotificationChannel.SMS) {
        createDto.recipient_phone = user.phone
      }

      // Create notification
      const notification = this.notificationRepository.create({
        ...createDto,
        scheduled_for: createDto.scheduled_for ? new Date(createDto.scheduled_for) : new Date(),
      })

      const savedNotification = await this.notificationRepository.save(notification)

      // Send immediately if not scheduled for future
      if (!savedNotification.is_scheduled) {
        await this.sendNotification(savedNotification.id)
      }

      const duration = Date.now() - startTime
      this.logger.log(`Notification created successfully in ${duration}ms. ID: ${savedNotification.id}`)

      return this.mapToResponseDto(savedNotification)
    } catch (error) {
      this.logger.error("Failed to create notification", error.stack)
      throw error
    }
  }

  async sendTemplateNotification(sendDto: SendTemplateNotificationDto): Promise<NotificationResponseDto> {
    try {
      // Get user
      const user = await this.userRepository.findOne({
        where: { id: sendDto.user_id, is_active: true },
      })

      if (!user) {
        throw new NotFoundException("User not found or inactive")
      }

      // Check user preferences
      const isAllowed = await this.checkUserPreferences(user.id, sendDto.template_key, sendDto.channel)
      if (!isAllowed) {
        throw new BadRequestException("User has disabled this type of notification")
      }

      // Render template
      const rendered = await this.templateService.renderTemplate(
        sendDto.template_key,
        { ...sendDto.variables, user },
        user.preferred_language,
      )

      // Create notification
      const createDto: CreateNotificationDto = {
        user_id: sendDto.user_id,
        channel: sendDto.channel,
        priority: sendDto.priority,
        subject: rendered.subject,
        content: rendered.content,
        html_content: rendered.html_content,
        data: sendDto.data,
        variables: sendDto.variables,
        scheduled_for: sendDto.scheduled_for,
        reference_type: sendDto.reference_type,
        reference_id: sendDto.reference_id,
      }

      return this.createNotification(createDto)
    } catch (error) {
      this.logger.error("Failed to send template notification", error.stack)
      throw error
    }
  }

  async sendBulkTemplateNotification(bulkDto: BulkSendTemplateNotificationDto): Promise<NotificationResponseDto[]> {
    const results: NotificationResponseDto[] = []

    // Process users in batches
    const batchSize = 50
    for (let i = 0; i < bulkDto.user_ids.length; i += batchSize) {
      const batch = bulkDto.user_ids.slice(i, i + batchSize)

      const batchPromises = batch.map(async (userId) => {
        try {
          const sendDto: SendTemplateNotificationDto = {
            ...bulkDto,
            user_id: userId,
          }
          return await this.sendTemplateNotification(sendDto)
        } catch (error) {
          this.logger.error(`Failed to send notification to user ${userId}`, error.stack)
          return null
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults.filter(Boolean))

      // Small delay between batches
      if (i + batchSize < bulkDto.user_ids.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    this.logger.log(`Bulk notification sending completed. ${results.length}/${bulkDto.user_ids.length} successful`)

    return results
  }

  async sendNotification(notificationId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
      relations: ["user"],
    })

    if (!notification) {
      throw new NotFoundException("Notification not found")
    }

    if (notification.status !== NotificationStatus.PENDING) {
      this.logger.warn(`Notification ${notificationId} is not in pending status`)
      return
    }

    try {
      let result: { success: boolean; message_id?: string; error?: string }

      switch (notification.channel) {
        case NotificationChannel.EMAIL:
          result = await this.emailService.sendEmail({
            to: notification.recipient_email || notification.user.email,
            subject: notification.subject || "Notification",
            content: notification.content,
            html_content: notification.html_content,
          })
          break

        case NotificationChannel.SMS:
          result = await this.smsService.sendSms({
            to: notification.recipient_phone || notification.user.phone,
            content: notification.content,
          })
          break

        case NotificationChannel.IN_APP:
          // In-app notifications are just stored in database
          result = { success: true, message_id: `in_app_${Date.now()}` }
          break

        case NotificationChannel.PUSH:
          // Implement push notification logic here
          result = { success: true, message_id: `push_${Date.now()}` }
          break

        default:
          throw new Error(`Unsupported notification channel: ${notification.channel}`)
      }

      // Update notification status
      if (result.success) {
        notification.status = NotificationStatus.SENT
        notification.sent_at = new Date()
        notification.external_id = result.message_id
      } else {
        notification.status = NotificationStatus.FAILED
        notification.error_message = result.error
        notification.retry_count += 1
      }

      await this.notificationRepository.save(notification)

      this.logger.log(`Notification ${notificationId} ${result.success ? "sent" : "failed"}`)
    } catch (error) {
      notification.status = NotificationStatus.FAILED
      notification.error_message = error.message
      notification.retry_count += 1
      await this.notificationRepository.save(notification)

      this.logger.error(`Failed to send notification ${notificationId}`, error.stack)
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledNotifications(): Promise<void> {
    const now = new Date()
    const scheduledNotifications = await this.notificationRepository.find({
      where: {
        status: NotificationStatus.PENDING,
        scheduled_for: LessThanOrEqual(now),
      },
      take: 100, // Process in batches
      order: { scheduled_for: "ASC" },
    })

    if (scheduledNotifications.length === 0) {
      return
    }

    this.logger.log(`Processing ${scheduledNotifications.length} scheduled notifications`)

    for (const notification of scheduledNotifications) {
      try {
        await this.sendNotification(notification.id)
      } catch (error) {
        this.logger.error(`Failed to process scheduled notification ${notification.id}`, error.stack)
      }
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryFailedNotifications(): Promise<void> {
    const failedNotifications = await this.notificationRepository.find({
      where: {
        status: NotificationStatus.FAILED,
        retry_count: LessThan(3), // Max 3 retries
        created_at: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)), // Only retry within 24 hours
      },
      take: 50,
      order: { created_at: "ASC" },
    })

    if (failedNotifications.length === 0) {
      return
    }

    this.logger.log(`Retrying ${failedNotifications.length} failed notifications`)

    for (const notification of failedNotifications) {
      try {
        notification.status = NotificationStatus.PENDING
        await this.notificationRepository.save(notification)
        await this.sendNotification(notification.id)
      } catch (error) {
        this.logger.error(`Failed to retry notification ${notification.id}`, error.stack)
      }
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user_id: userId },
    })

    if (!notification) {
      throw new NotFoundException("Notification not found")
    }

    if (!notification.is_read) {
      notification.is_read = true
      notification.read_at = new Date()
      await this.notificationRepository.save(notification)

      this.logger.log(`Notification ${notificationId} marked as read by user ${userId}`)
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true, read_at: new Date() },
    )

    this.logger.log(`All notifications marked as read for user ${userId}`)
  }

  async getUserNotifications(
    userId: string,
    options: {
      channel?: NotificationChannel
      status?: NotificationStatus
      is_read?: boolean
      limit?: number
      offset?: number
    } = {},
  ): Promise<{ notifications: NotificationResponseDto[]; total: number }> {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder("notification")
      .leftJoinAndSelect("notification.template", "template")
      .where("notification.user_id = :userId", { userId })

    if (options.channel) {
      queryBuilder.andWhere("notification.channel = :channel", { channel: options.channel })
    }

    if (options.status) {
      queryBuilder.andWhere("notification.status = :status", { status: options.status })
    }

    if (options.is_read !== undefined) {
      queryBuilder.andWhere("notification.is_read = :isRead", { isRead: options.is_read })
    }

    const total = await queryBuilder.getCount()

    queryBuilder
      .orderBy("notification.created_at", "DESC")
      .limit(options.limit || 50)
      .offset(options.offset || 0)

    const notifications = await queryBuilder.getMany()

    return {
      notifications: notifications.map((notification) => this.mapToResponseDto(notification)),
      total,
    }
  }

  async getNotificationStats(userId: string): Promise<NotificationStatsDto> {
    const stats = await this.notificationRepository
      .createQueryBuilder("notification")
      .select("notification.status", "status")
      .addSelect("notification.channel", "channel")
      .addSelect("notification.priority", "priority")
      .addSelect("COUNT(*)", "count")
      .where("notification.user_id = :userId", { userId })
      .groupBy("notification.status, notification.channel, notification.priority")
      .getRawMany()

    const unreadCount = await this.notificationRepository.count({
      where: { user_id: userId, is_read: false },
    })

    const totalNotifications = await this.notificationRepository.count({
      where: { user_id: userId },
    })

    // Process stats
    const byStatus: Record<NotificationStatus, number> = {} as any
    const byChannel: Record<NotificationChannel, number> = {} as any
    const byPriority: Record<string, number> = {}

    stats.forEach((stat) => {
      byStatus[stat.status] = (byStatus[stat.status] || 0) + Number.parseInt(stat.count)
      byChannel[stat.channel] = (byChannel[stat.channel] || 0) + Number.parseInt(stat.count)
      byPriority[stat.priority] = (byPriority[stat.priority] || 0) + Number.parseInt(stat.count)
    })

    return {
      total_notifications: totalNotifications,
      unread_count: unreadCount,
      by_status: byStatus,
      by_channel: byChannel,
      by_priority: byPriority as any,
    }
  }

  private async checkUserPreferences(
    userId: string,
    templateKey: string,
    channel: NotificationChannel,
  ): Promise<boolean> {
    // Get template to determine category
    const template = await this.templateService.getTemplate(templateKey)

    // Check user preference for this category and channel
    const preference = await this.preferenceRepository.findOne({
      where: {
        user_id: userId,
        category: template.category,
        channel,
      },
    })

    // If no preference set, default to enabled
    if (!preference) {
      return true
    }

    // Check if notifications are enabled
    if (!preference.is_enabled) {
      return false
    }

    // Check quiet hours
    if (preference.quiet_hours_start && preference.quiet_hours_end) {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

      if (currentTime >= preference.quiet_hours_start && currentTime <= preference.quiet_hours_end) {
        return false
      }
    }

    return true
  }

  private mapToResponseDto(notification: Notification): NotificationResponseDto {
    return {
      id: notification.id,
      user_id: notification.user_id,
      template_id: notification.template_id,
      channel: notification.channel,
      status: notification.status,
      priority: notification.priority,
      subject: notification.subject,
      content: notification.content,
      html_content: notification.html_content,
      data: notification.data,
      recipient_email: notification.recipient_email,
      recipient_phone: notification.recipient_phone,
      is_read: notification.is_read,
      read_at: notification.read_at,
      scheduled_for: notification.scheduled_for,
      sent_at: notification.sent_at,
      delivered_at: notification.delivered_at,
      error_message: notification.error_message,
      retry_count: notification.retry_count,
      reference_type: notification.reference_type,
      reference_id: notification.reference_id,
      created_at: notification.created_at,
      updated_at: notification.updated_at,
      user: notification.user
        ? {
            id: notification.user.id,
            full_name: notification.user.full_name,
            email: notification.user.email,
          }
        : undefined,
      template: notification.template
        ? {
            id: notification.template.id,
            name: notification.template.name,
            template_key: notification.template.template_key,
            category: notification.template.category,
          }
        : undefined,
    }
  }
}
