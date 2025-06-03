import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { CreateSubscriptionPlanDto } from '../dtos/create-subscription-plan.dto';
import { SubscriptionPlanResponseDto } from '../dtos/subscription-plan-response.dto';

@Injectable()
export class SubscriptionPlanService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private planRepository: Repository<SubscriptionPlan>,
  ) {}

  async create(
    createDto: CreateSubscriptionPlanDto,
  ): Promise<SubscriptionPlanResponseDto> {
    const plan = this.planRepository.create(createDto);
    const savedPlan = await this.planRepository.save(plan);
    return this.mapToResponseDto(savedPlan);
  }

  async findAll(): Promise<SubscriptionPlanResponseDto[]> {
    const plans = await this.planRepository.find();
    return plans.map(plan => this.mapToResponseDto(plan));
  }

  async findOne(id: string): Promise<SubscriptionPlanResponseDto> {
    const plan = await this.planRepository.findOneBy({ id });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    return this.mapToResponseDto(plan);
  }

  async update(
    id: string,
    updateDto: Partial<CreateSubscriptionPlanDto>,
  ): Promise<SubscriptionPlanResponseDto> {
    const plan = await this.planRepository.findOneBy({ id });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    const updatedPlan = await this.planRepository.save({
      ...plan,
      ...updateDto,
    });

    return this.mapToResponseDto(updatedPlan);
  }

  async deactivate(id: string): Promise<SubscriptionPlanResponseDto> {
    const plan = await this.planRepository.findOneBy({ id });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    plan.isActive = false;
    const updatedPlan = await this.planRepository.save(plan);
    return this.mapToResponseDto(updatedPlan);
  }

  private mapToResponseDto(
    plan: SubscriptionPlan,
  ): SubscriptionPlanResponseDto {
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      billingCycle: plan.billingCycle,
      deliveryFrequency: plan.deliveryFrequency,
      isActive: plan.isActive,
      productIds: plan.productIds,
      features: plan.features,
      createdAt: plan.createdAt,
    };
  }
}
