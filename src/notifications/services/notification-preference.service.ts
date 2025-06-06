import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { NotificationPreference } from "../entities/notification-preference.entity"
import { NotificationChannel, TemplateCategory } from "../entities/notification-template.entity"
import type { User } from "../entities/user.entity"
import type { UpdateNotificationPreferenceDto, BulkUpdatePreferencesDto } from "../dto/notification-preference.dto"
import type { NotificationPreferenceResponseDto } from "../dto/notification-response.dto"

@Injectable()
export class NotificationPreferenceService {
  private readonly logger = new Logger(NotificationPreferenceService.name);

  constructor(
    private readonly preferenceRepository: Repository<NotificationPreference>,
    private readonly userRepository: Repository<User>,
    @InjectRepository(NotificationPreference)
  ) {}

  async updatePreference(updateDto: UpdateNotificationPreferenceDto): Promise<NotificationPreferenceResponseDto> {
    // Validate user exists
    const user = await this.userRepository.findOne({
      where: { id: updateDto.user_id, is_active: true },
    })

    if (!user) {
      throw new NotFoundException("User not found or inactive")
    }

    // Find existing preference or create new one
    let preference = await this.preferenceRepository.findOne({
      where: {
        user_id: updateDto.user_id,
        category: updateDto.category,
        channel: updateDto.channel,
      },
    })

    if (preference) {
      // Update existing preference
      Object.assign(preference, updateDto)
    } else {
      // Create new preference
      preference = this.preferenceRepository.create(updateDto)
    }

    const savedPreference = await this.preferenceRepository.save(preference)

    this.logger.log(
      `Notification preference updated for user ${updateDto.user_id}: ${updateDto.category}/${updateDto.channel} = ${updateDto.is_enabled}`,
    )

    return this.mapToResponseDto(savedPreference)
  }

  async bulkUpdatePreferences(bulkDto: BulkUpdatePreferencesDto): Promise<NotificationPreferenceResponseDto[]> {
    const results: NotificationPreferenceResponseDto[] = []

    for (const preferenceData of bulkDto.preferences) {
      try {
        const updateDto: UpdateNotificationPreferenceDto = {
          user_id: bulkDto.user_id,
          ...preferenceData,
        }
        const result = await this.updatePreference(updateDto)
        results.push(result)
      } catch (error) {
        this.logger.error(
          `Failed to update preference for ${preferenceData.category}/${preferenceData.channel}`,
          error.stack,
        )
      }
    }

    this.logger.log(
      `Bulk preference update completed for user ${bulkDto.user_id}. ${results.length} preferences updated`,
    )

    return results
  }

  async getUserPreferences(userId: string): Promise<NotificationPreferenceResponseDto[]> {
    const preferences = await this.preferenceRepository.find({
      where: { user_id: userId },
      order: { category: "ASC", channel: "ASC" },
    })

    return preferences.map((preference) => this.mapToResponseDto(preference))
  }

  async getPreferencesByCategory(
    userId: string,
    category: TemplateCategory,
  ): Promise<NotificationPreferenceResponseDto[]> {
    const preferences = await this.preferenceRepository.find({
      where: { user_id: userId, category },
      order: { channel: "ASC" },
    })

    return preferences.map((preference) => this.mapToResponseDto(preference))
  }

  async getPreferencesByChannel(
    userId: string,
    channel: NotificationChannel,
  ): Promise<NotificationPreferenceResponseDto[]> {
    const preferences = await this.preferenceRepository.find({
      where: { user_id: userId, channel },
      order: { category: "ASC" },
    })

    return preferences.map((preference) => this.mapToResponseDto(preference))
  }

  async initializeDefaultPreferences(userId: string): Promise<void> {
    const existingPreferences = await this.preferenceRepository.count({
      where: { user_id: userId },
    })

    if (existingPreferences > 0) {
      this.logger.log(`User ${userId} already has notification preferences`)
      return
    }

    // Create default preferences for all category/channel combinations
    const defaultPreferences: Partial<NotificationPreference>[] = []

    for (const category of Object.values(TemplateCategory)) {
      for (const channel of Object.values(NotificationChannel)) {
        defaultPreferences.push({
          user_id: userId,
          category,
          channel,
          is_enabled: this.getDefaultEnabledState(category, channel),
          frequency: "immediate",
        })
      }
    }

    await this.preferenceRepository.save(defaultPreferences)

    this.logger.log(`Default notification preferences initialized for user ${userId}`)
  }

  async resetToDefaults(userId: string): Promise<void> {
    // Delete existing preferences
    await this.preferenceRepository.delete({ user_id: userId })

    // Initialize default preferences
    await this.initializeDefaultPreferences(userId)

    this.logger.log(`Notification preferences reset to defaults for user ${userId}`)
  }

  async disableAllNotifications(userId: string): Promise<void> {
    await this.preferenceRepository.update({ user_id: userId }, { is_enabled: false })

    this.logger.log(`All notifications disabled for user ${userId}`)
  }

  async enableAllNotifications(userId: string): Promise<void> {
    await this.preferenceRepository.update({ user_id: userId }, { is_enabled: true })

    this.logger.log(`All notifications enabled for user ${userId}`)
  }

  private getDefaultEnabledState(category: TemplateCategory, channel: NotificationChannel): boolean {
    // Define default enabled states based on category and channel
    const defaults: Record<TemplateCategory, Record<NotificationChannel, boolean>> = {
      [TemplateCategory.APPOINTMENT]: {
        [NotificationChannel.EMAIL]: true,
        [NotificationChannel.SMS]: true,
        [NotificationChannel.IN_APP]: true,
        [NotificationChannel.PUSH]: true,
      },
      [TemplateCategory.REMINDER]: {
        [NotificationChannel.EMAIL]: true,
        [NotificationChannel.SMS]: true,
        [NotificationChannel.IN_APP]: true,
        [NotificationChannel.PUSH]: true,
      },
      [TemplateCategory.SYSTEM]: {
        [NotificationChannel.EMAIL]: true,
        [NotificationChannel.SMS]: false,
        [NotificationChannel.IN_APP]: true,
        [NotificationChannel.PUSH]: false,
      },
      [TemplateCategory.SECURITY]: {
        [NotificationChannel.EMAIL]: true,
        [NotificationChannel.SMS]: true,
        [NotificationChannel.IN_APP]: true,
        [NotificationChannel.PUSH]: true,
      },
      [TemplateCategory.BILLING]: {
        [NotificationChannel.EMAIL]: true,
        [NotificationChannel.SMS]: false,
        [NotificationChannel.IN_APP]: true,
        [NotificationChannel.PUSH]: false,
      },
      [TemplateCategory.MARKETING]: {
        [NotificationChannel.EMAIL]: false,
        [NotificationChannel.SMS]: false,
        [NotificationChannel.IN_APP]: false,
        [NotificationChannel.PUSH]: false,
      },
    }

    return defaults[category]?.[channel] ?? true
  }

  private mapToResponseDto(preference: NotificationPreference): NotificationPreferenceResponseDto {
    return {
      id: preference.id,
      user_id: preference.user_id,
      category: preference.category,
      channel: preference.channel,
      is_enabled: preference.is_enabled,
      settings: preference.settings,
      quiet_hours_start: preference.quiet_hours_start,
      quiet_hours_end: preference.quiet_hours_end,
      frequency: preference.frequency,
      created_at: preference.created_at,
      updated_at: preference.updated_at,
    }
  }
}
