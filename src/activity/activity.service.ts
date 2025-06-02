import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { PetService } from '@/pet/pet.service';
import { GetActivitiesDto } from './dto/get-activities.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    private petsService: PetService,
  ) {}

  async create(
    createDto: CreateActivityDto,
    userId: string,
  ): Promise<Activity> {
    // Verify user has access to the pet
    await this.petsService.findOne(createDto.petId, userId);

    const activity = this.activityRepository.create({
      ...createDto,
      activityDate: new Date(createDto.activityDate),
      recordedById: userId,
    });

    return this.activityRepository.save(activity);
  }

  async findByPet(petId: string, query: GetActivitiesDto, userId: string) {
    // Verify user has access to the pet
    await this.petsService.findOne(petId, userId);

    const queryBuilder = this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.recordedBy', 'recordedBy')
      .where('activity.petId = :petId', { petId });

    if (query.type) {
      queryBuilder.andWhere('activity.type = :type', { type: query.type });
    }

    if (query.startDate && query.endDate) {
      queryBuilder.andWhere(
        'activity.activityDate BETWEEN :startDate AND :endDate',
        {
          startDate: new Date(query.startDate),
          endDate: new Date(query.endDate),
        },
      );
    }

    const [activities, total] = await queryBuilder
      .orderBy('activity.activityDate', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return {
      activities,
      total,
      page: query.page,
      pages: Math.ceil(total / query.limit),
    };
  }

  async getActivityStats(petId: string, userId: string) {
    // Verify user has access to the pet
    await this.petsService.findOne(petId, userId);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [weeklyStats, monthlyStats, typeStats] = await Promise.all([
      this.activityRepository
        .createQueryBuilder('activity')
        .select('COUNT(*)', 'count')
        .addSelect('SUM(activity.duration)', 'totalDuration')
        .where('activity.petId = :petId', { petId })
        .andWhere('activity.activityDate >= :weekAgo', { weekAgo })
        .getRawOne(),

      this.activityRepository
        .createQueryBuilder('activity')
        .select('COUNT(*)', 'count')
        .addSelect('SUM(activity.duration)', 'totalDuration')
        .where('activity.petId = :petId', { petId })
        .andWhere('activity.activityDate >= :monthAgo', { monthAgo })
        .getRawOne(),

      this.activityRepository
        .createQueryBuilder('activity')
        .select('activity.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(activity.duration)', 'totalDuration')
        .where('activity.petId = :petId', { petId })
        .andWhere('activity.activityDate >= :monthAgo', { monthAgo })
        .groupBy('activity.type')
        .getRawMany(),
    ]);

    return {
      weekly: {
        activities: parseInt(weeklyStats.count) || 0,
        totalDuration: parseInt(weeklyStats.totalDuration) || 0,
      },
      monthly: {
        activities: parseInt(monthlyStats.count) || 0,
        totalDuration: parseInt(monthlyStats.totalDuration) || 0,
      },
      byType: typeStats.map(stat => ({
        type: stat.type,
        count: parseInt(stat.count),
        totalDuration: parseInt(stat.totalDuration) || 0,
      })),
    };
  }

  async update(
    id: string,
    updateDto: Partial<CreateActivityDto>,
    userId: string,
  ): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['pet'],
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    // Verify user has access to the pet
    await this.petsService.findOne(activity.petId, userId);

    if (updateDto.activityDate) {
      updateDto.activityDate = new Date(updateDto.activityDate) as any;
    }

    Object.assign(activity, updateDto);
    return this.activityRepository.save(activity);
  }

  async remove(id: string, userId: string): Promise<void> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['pet'],
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    // Verify user has access to the pet
    await this.petsService.findOne(activity.petId, userId);

    await this.activityRepository.remove(activity);
  }
}
