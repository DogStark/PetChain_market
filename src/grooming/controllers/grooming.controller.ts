import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { UpdateGroomingPackageDto } from '../dto/update-grooming-package.dto';
import { CreateGroomingPackageDto } from '../dto/create-grooming-package.dto';
import { GroomingService } from '../services/grooming.service';


@Controller('grooming-packages')
export class GroomingController {
  constructor(private readonly service: GroomingService) {}

  @Post()
  create(@Body() dto: CreateGroomingPackageDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGroomingPackageDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
