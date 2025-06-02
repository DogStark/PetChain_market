import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { GetActivitiesDto } from './dto/get-activities.dto';
import { ActivitiesService } from './activity.service';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';

@ApiTags('activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Record new activity' })
  create(@Body() createDto: CreateActivityDto, @Req() req) {
    return this.activitiesService.create(createDto, req.user.id);
  }

  @Get('pet/:petId')
  @ApiOperation({ summary: 'Get activities for a pet' })
  findByPet(
    @Param('petId') petId: string,
    @Query() query: GetActivitiesDto,
    @Req() req,
  ) {
    return this.activitiesService.findByPet(petId, query, req.user.id);
  }

  @Get('pet/:petId/stats')
  @ApiOperation({ summary: 'Get activity statistics for a pet' })
  getStats(@Param('petId') petId: string, @Req() req) {
    return this.activitiesService.getActivityStats(petId, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update activity' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateActivityDto,
    @Req() req,
  ) {
    return this.activitiesService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete activity' })
  remove(@Param('id') id: string, @Req() req) {
    return this.activitiesService.remove(id, req.user.id);
  }
}
