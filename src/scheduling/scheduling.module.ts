import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { SchedulePattern } from './entities/schedule-pattern.entity';
import { TimeSlot } from './entities/time-slot.entity';
import { ScheduleException } from './entities/schedule-exception.entity';
import { SchedulingConfig } from './entities/scheduling-config.entity';
import { AvailabilitySchedule } from '../Veterinarian and Staff Module/entities/availability-schedule.entity';

// Services
import { SchedulePatternService } from './services/schedule-pattern.service';
import { TimeSlotService } from './services/time-slot.service';
import { ScheduleExceptionService } from './services/schedule-exception.service';
import { SchedulingConfigService } from './services/scheduling-config.service';
import { SchedulingService } from './services/scheduling.service';

// Controllers
import { SchedulePatternController } from './controllers/schedule-pattern.controller';
import { TimeSlotController } from './controllers/time-slot.controller';
import { ScheduleExceptionController } from './controllers/schedule-exception.controller';
import { SchedulingConfigController } from './controllers/scheduling-config.controller';
import { SchedulingController } from './controllers/scheduling.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SchedulePattern,
      TimeSlot,
      ScheduleException,
      SchedulingConfig,
      AvailabilitySchedule,
    ]),
  ],
  controllers: [
    SchedulePatternController,
    TimeSlotController,
    ScheduleExceptionController,
    SchedulingConfigController,
    SchedulingController,
  ],
  providers: [
    SchedulePatternService,
    TimeSlotService,
    ScheduleExceptionService,
    SchedulingConfigService,
    SchedulingService,
  ],
  exports: [
    SchedulePatternService,
    TimeSlotService,
    ScheduleExceptionService,
    SchedulingConfigService,
    SchedulingService,
  ],
})
export class SchedulingModule {}
