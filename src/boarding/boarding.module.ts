import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardingController } from './boarding.controller';
import { BoardingService } from './boarding.service';
import { ActivityService } from './activity.service';
import { PricingService } from './pricing.service';
import { Booking } from './entities/booking.entity';
import { BoardingFacility } from './entities/boarding-facility.entity';
import { PricingPackage } from './entities/pricing-package.entity';
import { Activity } from './entities/activity.entity';
import { Photo } from './entities/photo.entity';
import { Pet } from '../pets/entities/pet.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      BoardingFacility,
      PricingPackage,
      Activity,
      Photo,
      Pet,
      User,
    ]),
  ],
  controllers: [BoardingController],
  providers: [BoardingService, ActivityService, PricingService],
  exports: [BoardingService],
})
export class BoardingModule { }