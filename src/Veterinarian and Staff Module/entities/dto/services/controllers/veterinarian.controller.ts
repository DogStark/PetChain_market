import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { VeterinarianService } from '../services/veterinarian.service';
import { CreateVeterinarianDto } from '../dto/create-veterinarian.dto';

@Controller('veterinarians')
export class VeterinarianController {
  constructor(private readonly veterinarianService: VeterinarianService) {}

  @Post()
  create(@Body() createVeterinarianDto: CreateVeterinarianDto) {
    return this.veterinarianService.create(createVeterinarianDto);
  }

  @Get()
  findAll() {
    return this.veterinarianService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.veterinarianService.findOne(id);
  }

  @Get(':id/profile')
  getProfile(@Param('id', ParseIntPipe) id: number) {
    return this.veterinarianService.getProfile(id);
  }

  @Get('specialization/:specializationId')
  findBySpecialization(@Param('specializationId', ParseIntPipe) specializationId: number) {
    return this.veterinarianService.findBySpecialization(specializationId);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateData: Partial<CreateVeterinarianDto>) {
    return this.veterinarianService.updateProfile(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.veterinarianService.remove(id);
  }
}
