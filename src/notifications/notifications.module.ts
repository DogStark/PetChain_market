import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ScheduleModule } from "@nestjs/schedule"
import { ConfigModule } from "@nestjs/config"
import { User } from "./entities/user.entity"
import { Notification } from "./entities/notification.entity"
import { NotificationTemplate } from "./entities/notification-template.entity"
import { NotificationPreference } from "./entities/notification-preference.entity"
import { NotificationService } from "./services/notification.service"
import { NotificationPreferenceService } from "./services/notification-preference.service"
import { TemplateService } from "./services/template.service"
import { EmailService } from "./services/email.service"
import { SmsService } from "./services/sms.service"
import { NotificationController } from "./controllers/notification.controller"
import { NotificationPreferenceController } from "./controllers/notification-preference.controller"

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Notification, NotificationTemplate, NotificationPreference]),
    ScheduleModule.forRoot(),
    ConfigModule,
  ],
  controllers: [NotificationController, NotificationPreferenceController],
  providers: [NotificationService, NotificationPreferenceService, TemplateService, EmailService, SmsService],
  exports: [NotificationService, NotificationPreferenceService, TemplateService, EmailService, SmsService],
})
export class NotificationsModule {}
