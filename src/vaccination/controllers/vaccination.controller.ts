import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { VaccinationService } from '../services/vaccination.service';
import { VaccinationCertificateService } from '../services/vaccination-certificate.service';
import { CreateVaccinationRecordDto } from '../dto/create-vaccination-record.dto';
import { CreateVaccinationScheduleDto } from '../dto/create-vaccination-schedule.dto';

@Controller('vaccination')
export class VaccinationController {
  constructor(
    private readonly vaccinationService: VaccinationService,
    private readonly certificateService: VaccinationCertificateService,
  ) {}

  @Post('records')
  async createVaccinationRecord(@Body() dto: CreateVaccinationRecordDto) {
    return await this.vaccinationService.createVaccinationRecord(dto);
  }

  @Post('schedules')
  async createVaccinationSchedule(@Body() dto: CreateVaccinationScheduleDto) {
    return await this.vaccinationService.createVaccinationSchedule(dto);
  }

  @Get('pets/:petId/history')
  async getPetVaccinationHistory(@Param('petId') petId: string) {
    return await this.vaccinationService.getPetVaccinationHistory(petId);
  }

  @Get('pets/:petId/schedule')
  async getPetVaccinationSchedule(@Param('petId') petId: string) {
    return await this.vaccinationService.getPetVaccinationSchedule(petId);
  }

  @Get('upcoming')
  async getUpcomingVaccinations(@Query('days') days?: number) {
    return await this.vaccinationService.getUpcomingVaccinations(days);
  }

  @Get('overdue')
  async getOverdueVaccinations() {
    return await this.vaccinationService.getOverdueVaccinations();
  }

  @Post('pets/:petId/schedule-from-template/:templateId')
  async createScheduleFromTemplate(
    @Param('petId') petId: string,
    @Param('templateId') templateId: string,
  ) {
    return await this.vaccinationService.createScheduleFromTemplate(petId, templateId);
  }

  @Get('records/:recordId/certificate')
  async generateCertificate(
    @Param('recordId') recordId: string,
    @Res() res: Response,
  ) {

  }

  @Get('pets/:petId/history/pdf')
  async generateVaccinationHistoryPDF(
    @Param('petId') petId: string,
    @Res() res: Response,
  ) {
    const vaccinationRecords = await this.vaccinationService.getPetVaccinationHistory(petId);
    
    const historyPDF = await this.certificateService.generateVaccinationHistory(
      petId,
      vaccinationRecords,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=vaccination-history-${petId}.pdf`,
    });

    res.send(historyPDF);
  }
}