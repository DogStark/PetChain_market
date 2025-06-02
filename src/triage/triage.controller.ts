import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TriageService } from './triage.service';
import { CreateTriageDto } from './dto/create-triage.dto';
import { UpdateTriageDto } from './dto/update-triage.dto';

@Controller('triage')
export class TriageController {
  constructor(private readonly triageService: TriageService) {}

  @Post()
  create(@Body() createTriageDto: CreateTriageDto) {
    return this.triageService.create(createTriageDto);
  }

  @Get()
  findAll() {
    return this.triageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.triageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTriageDto: UpdateTriageDto) {
    return this.triageService.update(+id, updateTriageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.triageService.remove(+id);
  }
}
