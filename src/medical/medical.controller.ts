import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateMedicalHistoryDto } from './dto/create-medical-history.dto';
import { UpdateMedicalHistoryDto } from './dto/update-medical-history.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { MedicalHistoryService } from './medical.service';

@ApiTags('medical-history')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('medical-history')
export class MedicalHistoryController {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create medical history record' })
  create(@Body() createDto: CreateMedicalHistoryDto, @Req() req) {
    return this.medicalHistoryService.create(createDto, req.user.id);
  }

  @Get('pet/:petId')
  @ApiOperation({ summary: 'Get medical history for a pet' })
  findByPet(@Param('petId') petId: string, @Req() req) {
    return this.medicalHistoryService.findByPet(petId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medical history record by ID' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.medicalHistoryService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update medical history record' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMedicalHistoryDto,
    @Req() req,
  ) {
    return this.medicalHistoryService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete medical history record' })
  remove(@Param('id') id: string, @Req() req) {
    return this.medicalHistoryService.remove(id, req.user.id);
  }
}
