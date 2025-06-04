import { PartialType } from '@nestjs/swagger';
import { CreateSchedulingConfigDto } from './create-scheduling-config.dto';

export class UpdateSchedulingConfigDto extends PartialType(CreateSchedulingConfigDto) {}
