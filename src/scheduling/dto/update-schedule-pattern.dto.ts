import { PartialType } from '@nestjs/swagger';
import { CreateSchedulePatternDto } from './create-schedule-pattern.dto';

export class UpdateSchedulePatternDto extends PartialType(CreateSchedulePatternDto) {}
