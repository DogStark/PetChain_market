import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { typeOrmConfig } from './config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetModule } from './pet/pet.module';
import { NotificationModule } from './notification/notification.module';
import { PricingModule } from './pricing/pricing.module';
import { TriageModule } from './triage/triage.module';
import { EmergencyBookingModule } from './emergency-booking/emergency-booking.module';
import { ActivityModule } from './activity/activity.module';
import { PhotoModule } from './photo/photo.module';
import { MedicalModule } from './medical/medical.module';
import { MedicalRecordModule } from './pets/medical_record.module';
import { OrderModule } from './order/order.module';
import { ShoppingCartModule } from './shopping_cart/shopping_cart.module';
import { StaffModule } from './veterinarian/staff/staff.module';
import { EmergencyModule } from './emergency/emergency.module';
import { TelemedicineModule } from './telemedicine/telemedicine.module';
import { CustomerModule } from './customer-pet/customer-pet.module';
import { ReviewModule } from './review/review.module';


import { LoyaltyModule } from './loyalty/loyalty.module';
import { GroomingModule } from './grooming/grooming.module';



import { SubscriptionModule } from './subscription/subscription.module';
import { PaymentModule } from './payment/payment.module';


@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
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
    OrderModule,
    MedicalModule,
    PhotoModule,
    ActivityModule,
    EmergencyBookingModule,
    TriageModule,
    PricingModule,
    NotificationModule,
    GroomingModule,
    SubscriptionModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
