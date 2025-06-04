import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specialization } from '../entities/specialization.entity';

@Controller('specializations')
export class SpecializationController {
  constructor(
    @InjectRepository(Specialization)
    private specializationRepository: Repository<Specialization>,
  ) {}

  @Post()
  async create(@Body() createSpecializationDto: { name: string; description?: string }) {
    const specialization = this.specializationRepository.create(createSpecializationDto);
    return this.specializationRepository.save(specialization);
  }

  @Get()
  findAll() {
    return this.specializationRepository.find({
      relations: ['veterinarians']
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const specialization = await this.specializationRepository.findOne({
      where: { id },
      relations: ['veterinarians']
    });

    if (!specialization) {
      throw new Error(`Specialization with ID ${id} not found`);
    }

    return specialization;
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateData: { name?: string; description?: string }) {
    const specialization = await this.findOne(id);
    Object.assign(specialization, updateData);
    return this.specializationRepository.save(specialization);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const specialization = await this.findOne(id);
    await this.specializationRepository.remove(specialization);
  }
}
