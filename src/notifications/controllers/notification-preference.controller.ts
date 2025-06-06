import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  ValidationPipe,
  UsePipes,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from "@nestjs/common"
import type { NotificationPreferenceService } from "../services/notification-preference.service"
import type { UpdateNotificationPreferenceDto, BulkUpdatePreferencesDto } from "../dto/notification-preference.dto"
import type { NotificationChannel, TemplateCategory } from "../entities/notification-template.entity"

@Controller("notification-preferences")
export class NotificationPreferenceController {
  constructor(private readonly preferenceService: NotificationPreferenceService) {}

  @Put()
  @UsePipes(new ValidationPipe())
  async updatePreference(@Body() updateDto: UpdateNotificationPreferenceDto) {
    return this.preferenceService.updatePreference(updateDto);
  }

  @Put("bulk")
  @UsePipes(new ValidationPipe())
  async bulkUpdatePreferences(@Body() bulkDto: BulkUpdatePreferencesDto) {
    return this.preferenceService.bulkUpdatePreferences(bulkDto);
  }

  @Get("user/:userId")
  async getUserPreferences(@Param("userId", ParseUUIDPipe) userId: string) {
    return this.preferenceService.getUserPreferences(userId)
  }

  @Get("user/:userId/category/:category")
  async getPreferencesByCategory(
    @Param("userId", ParseUUIDPipe) userId: string,
    @Param("category") category: TemplateCategory,
  ) {
    return this.preferenceService.getPreferencesByCategory(userId, category)
  }

  @Get("user/:userId/channel/:channel")
  async getPreferencesByChannel(
    @Param("userId", ParseUUIDPipe) userId: string,
    @Param("channel") channel: NotificationChannel,
  ) {
    return this.preferenceService.getPreferencesByChannel(userId, channel)
  }

  @Post("user/:userId/initialize")
  @HttpCode(HttpStatus.CREATED)
  async initializeDefaultPreferences(@Param("userId", ParseUUIDPipe) userId: string) {
    await this.preferenceService.initializeDefaultPreferences(userId)
    return { message: "Default preferences initialized" }
  }

  @Post("user/:userId/reset")
  @HttpCode(HttpStatus.OK)
  async resetToDefaults(@Param("userId", ParseUUIDPipe) userId: string) {
    await this.preferenceService.resetToDefaults(userId)
    return { message: "Preferences reset to defaults" }
  }

  @Put("user/:userId/disable-all")
  @HttpCode(HttpStatus.OK)
  async disableAllNotifications(@Param("userId", ParseUUIDPipe) userId: string) {
    await this.preferenceService.disableAllNotifications(userId)
    return { message: "All notifications disabled" }
  }

  @Put("user/:userId/enable-all")
  @HttpCode(HttpStatus.OK)
  async enableAllNotifications(@Param("userId", ParseUUIDPipe) userId: string) {
    await this.preferenceService.enableAllNotifications(userId)
    return { message: "All notifications enabled" }
  }
}
