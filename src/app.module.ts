import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';


import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PetModule } from './pet/pet.module';
import { MedicalRecordModule } from './pets/medical_record.module';
import { ShoppingCartModule } from './shopping_cart/shopping_cart.module';
import { StaffModule } from './veterinarian/staff/staff.module';
import { EmergencyModule } from './emergency/emergency.module';
import { TelemedicineModule } from './telemedicine/telemedicine.module';
import { CustomerModule } from './customer-pet/customer-pet.module';
import { ReviewModule } from './review/review.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { MedicalModule } from './medical/medical.module';
import { PhotoModule } from './photo/photo.module';
import { ActivityModule } from './activity/activity.module';
import { EmergencyBookingModule } from './emergency-booking/emergency-booking.module';
import { TriageModule } from './triage/triage.module';
import { PricingModule } from './pricing/pricing.module';
import { NotificationModule } from './notification/notification.module';
import { OrderModule } from './order/order.module';
import { PetModule as PetsModule } from './pets/pet.module';
import { MedicalRecordModule as PetsMedicalRecordModule } from './medical_record/medical_record.module';
import { AdminModule } from './admin/admin.module';
import { GroomingModule } from './grooming/grooming.module';
import { SchedulingModule } from './scheduling/scheduling.module';

import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { LoggerModule } from './logger/logger.module';
import { SentryModule } from './sentry/sentry.module';

import { SubscriptionModule } from './subscription/subscription.module';
import { PaymentModule } from './payment/payment.module';


@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 10 }],
    }),

    UserModule,
    AuthModule,
    PetModule,
    MedicalRecordModule,
    ShoppingCartModule,
    StaffModule,
    EmergencyModule,
    TelemedicineModule,
    CustomerModule,
    ReviewModule,
    LoyaltyModule,
    MedicalModule,
    PhotoModule,
    ActivityModule,
    EmergencyBookingModule,
    TriageModule,
    PricingModule,
    NotificationModule,
    OrderModule,
    PetsModule,
    PetsMedicalRecordModule,
    AdminModule,
    GroomingModule,
    SchedulingModule,
    SubscriptionModule,
    PaymentModule,
    LoggerModule,
    MetricsModule,
    HealthModule,
    SentryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
