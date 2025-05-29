import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TelemedicineService } from '../services/telemedicine.service';
import { CreateTelemedicineDto } from '../dto/create-telemedicine.dto';
import { UpdateTelemedicineDto } from '../dto/update-telemedicine.dto';

@Controller('telemedicine')
export class TelemedicineController {
  constructor(private readonly telemedicineService: TelemedicineService) {}

  @Post()
  create(@Body() createTelemedicineDto: CreateTelemedicineDto) {
    return this.telemedicineService.create(createTelemedicineDto);
  }

  @Get()
  findAll() {
    return this.telemedicineService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.telemedicineService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTelemedicineDto: UpdateTelemedicineDto) {
    return this.telemedicineService.update(+id, updateTelemedicineDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.telemedicineService.remove(+id);
  }
}
