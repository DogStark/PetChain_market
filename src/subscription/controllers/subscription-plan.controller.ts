import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { SubscriptionPlanService } from '../services/subscription-plan.service';
import { CreateSubscriptionPlanDto } from '../dtos/create-subscription-plan.dto';
import { SubscriptionPlanResponseDto } from '../dtos/subscription-plan-response.dto';

@Controller('subscription-plans')
export class SubscriptionPlanController {
  constructor(private readonly planService: SubscriptionPlanService) {}

  @Post()
  async create(
    @Body() createDto: CreateSubscriptionPlanDto,
  ): Promise<SubscriptionPlanResponseDto> {
    return this.planService.create(createDto);
  }

  @Get()
  async findAll(): Promise<SubscriptionPlanResponseDto[]> {
    return this.planService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SubscriptionPlanResponseDto> {
    return this.planService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateSubscriptionPlanDto>,
  ): Promise<SubscriptionPlanResponseDto> {
    return this.planService.update(id, updateDto);
  }

  @Delete(':id')
  async deactivate(
    @Param('id') id: string,
  ): Promise<SubscriptionPlanResponseDto> {
    return this.planService.deactivate(id);
  }
}
