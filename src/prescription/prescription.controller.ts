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
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { CreatePrescriptionRefillDto } from './dto/create-prescription-refill.dto';
import { ProcessPrescriptionRefillDto } from './dto/process-prescription-refill.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';

@ApiTags('prescriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new prescription' })
  create(@Body() createDto: CreatePrescriptionDto, @Req() req) {
    return this.prescriptionService.create(createDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all prescriptions created by the current veterinarian' })
  findAll(@Req() req) {
    return this.prescriptionService.findAll(req.user.id);
  }

  @Get('pet/:petId')
  @ApiOperation({ summary: 'Get prescriptions for a specific pet' })
  findByPet(@Param('petId') petId: string, @Req() req) {
    return this.prescriptionService.findByPet(petId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get prescription by ID' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.prescriptionService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update prescription' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePrescriptionDto,
    @Req() req,
  ) {
    return this.prescriptionService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete prescription' })
  remove(@Param('id') id: string, @Req() req) {
    return this.prescriptionService.remove(id, req.user.id);
  }

  @Post(':id/fulfill')
  @ApiOperation({ summary: 'Fulfill a prescription' })
  fulfill(@Param('id') id: string, @Req() req) {
    return this.prescriptionService.fulfill(id, req.user.id);
  }

  @Post('refill')
  @ApiOperation({ summary: 'Request a prescription refill' })
  requestRefill(@Body() createDto: CreatePrescriptionRefillDto, @Req() req) {
    return this.prescriptionService.requestRefill(createDto, req.user.id);
  }

  @Patch('refill/:id')
  @ApiOperation({ summary: 'Process a prescription refill request' })
  processRefill(
    @Param('id') id: string,
    @Body() processDto: ProcessPrescriptionRefillDto,
    @Req() req,
  ) {
    return this.prescriptionService.processRefill(id, processDto, req.user.id);
  }

  @Get(':id/refill-history')
  @ApiOperation({ summary: 'Get refill history for a prescription' })
  getRefillHistory(@Param('id') id: string, @Req() req) {
    return this.prescriptionService.getRefillHistory(id, req.user.id);
  }
}
