import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ValidationPipe,
  UsePipes,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from "@nestjs/common"
import type { NotificationService } from "../services/notification.service"
import type { CreateNotificationDto } from "../dto/create-notification.dto"
import type {
  SendTemplateNotificationDto,
  BulkSendTemplateNotificationDto,
} from "../dto/send-template-notification.dto"
import type { NotificationChannel, NotificationStatus } from "../entities/notification.entity"

@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async createNotification(@Body() createDto: CreateNotificationDto) {
    return this.notificationService.createNotification(createDto);
  }

  @Post("template")
  @UsePipes(new ValidationPipe())
  async sendTemplateNotification(@Body() sendDto: SendTemplateNotificationDto) {
    return this.notificationService.sendTemplateNotification(sendDto);
  }

  @Post("template/bulk")
  @UsePipes(new ValidationPipe())
  async sendBulkTemplateNotification(@Body() bulkDto: BulkSendTemplateNotificationDto) {
    return this.notificationService.sendBulkTemplateNotification(bulkDto)
  }

  @Put(":id/read")
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param("id", ParseUUIDPipe) id: string, @Body("user_id", ParseUUIDPipe) userId: string) {
    await this.notificationService.markAsRead(id, userId)
    return { message: "Notification marked as read" }
  }

  @Put("user/:userId/read-all")
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Param("userId", ParseUUIDPipe) userId: string) {
    await this.notificationService.markAllAsRead(userId)
    return { message: "All notifications marked as read" }
  }

  @Get("user/:userId")
  async getUserNotifications(
    @Param("userId", ParseUUIDPipe) userId: string,
    @Query("channel") channel?: NotificationChannel,
    @Query("status") status?: NotificationStatus,
    @Query("is_read") isRead?: boolean,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number,
  ) {
    return this.notificationService.getUserNotifications(userId, {
      channel,
      status,
      is_read: isRead,
      limit,
      offset,
    })
  }

  @Get("user/:userId/stats")
  async getNotificationStats(@Param("userId", ParseUUIDPipe) userId: string) {
    return this.notificationService.getNotificationStats(userId)
  }

  @Post(":id/resend")
  @HttpCode(HttpStatus.OK)
  async resendNotification(@Param("id", ParseUUIDPipe) id: string) {
    await this.notificationService.sendNotification(id)
    return { message: "Notification resent" }
  }
}
