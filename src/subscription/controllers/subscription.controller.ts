import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { SubscriptionService } from '../services/subscription.service';
import { CreateSubscriptionDto } from '../dtos/create-subscription.dto';
import { UpdateSubscriptionDto } from '../dtos/update-subscription.dto';
import { SubscriptionResponseDto } from '../dtos/subscription-response.dto';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  async create(
    @Body() createDto: CreateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.create(createDto);
  }

  @Get()
  async findAll(): Promise<SubscriptionResponseDto[]> {
    return this.subscriptionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.update(id, updateDto);
  }

  @Delete(':id')
  async cancel(@Param('id') id: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.cancel(id);
  }

  @Post(':id/pause')
  async pause(@Param('id') id: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.pause(id);
  }

  @Post(':id/resume')
  async resume(@Param('id') id: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.resume(id);
  }

  @Get(':id/events')
  async getEvents(@Param('id') id: string) {
    return this.subscriptionService.getEvents(id);
  }
}
