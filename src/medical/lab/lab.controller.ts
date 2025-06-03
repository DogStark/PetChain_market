import { Controller, Post, Get, Body, Param, NotFoundException } from '@nestjs/common';
import { LabService } from './lab.service';
import { CreateLabTestOrderDto } from './dto/create-lab-test-order.dto';
import { CreateLabResultDto } from './dto/create-lab-result.dto';

@Controller('lab')
export class LabController {
  constructor(private readonly labService: LabService) {}

  @Post('orders')
  orderLabTest(@Body() dto: CreateLabTestOrderDto) {
    return this.labService.orderLabTest(dto);
  }

  @Post('orders/:orderId/results')
  uploadLabResult(@Param('orderId') orderId: number, @Body() dto: CreateLabResultDto) {
    return this.labService.uploadLabResult(orderId, dto);
  }

  @Get('history/:petId')
  getLabHistory(@Param('petId') petId: number) {
    return this.labService.getLabHistory(petId);
  }

  @Get('orders/:orderId/results')
  getLabResult(@Param('orderId') orderId: number) {
    return this.labService.getLabResult(orderId);
  }

  @Get('interpretation/:testType')
  getInterpretationGuide(@Param('testType') testType: string) {
    return this.labService.getInterpretationGuide(testType);
  }

  @Get('orders/:orderId/report')
  generateLabReport(@Param('orderId') orderId: number) {
    return this.labService.generateLabReport(orderId);
  }
} 