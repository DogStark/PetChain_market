import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { CreateConsultationDto, UpdateConsultationDto } from './dto';
import { Consultation } from './consultation.entity';

@Controller('consultations')
export class ConsultationController {
  constructor(private readonly consultService: ConsultationService) {}

  @Get()
  async findAll(): Promise<Consultation[]> {
    return this.consultService.listAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Consultation> {
    return this.consultService.getOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateConsultationDto,
  ): Promise<Consultation> {
    return this.consultService.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateConsultationDto,
  ): Promise<Consultation> {
    return this.consultService.update(id, dto);
  }
}
