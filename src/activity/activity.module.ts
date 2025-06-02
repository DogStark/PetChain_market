import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesController } from './activity.controller';
import { ActivitiesService } from './activity.service';
import { Activity } from './entities/activity.entity';
import { PetModule } from '@/pet/pet.module';

@Module({
  imports: [TypeOrmModule.forFeature([Activity]), PetModule],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
})
export class ActivityModule {}
