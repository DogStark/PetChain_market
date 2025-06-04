import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabTestOrder } from './lab-test-order.entity';
import { LabResult } from './lab-result.entity';
import { ResultInterpretationGuide } from './result-interpretation-guide.entity';
import { CreateLabTestOrderDto } from './dto/create-lab-test-order.dto';
import { CreateLabResultDto } from './dto/create-lab-result.dto';

@Injectable()
export class LabService {
  constructor(
    @InjectRepository(LabTestOrder)
    private labTestOrderRepository: Repository<LabTestOrder>,
    @InjectRepository(LabResult)
    private labResultRepository: Repository<LabResult>,
    @InjectRepository(ResultInterpretationGuide)
    private interpretationGuideRepository: Repository<ResultInterpretationGuide>,
  ) {}

  async orderLabTest(dto: CreateLabTestOrderDto): Promise<LabTestOrder> {
    const order = this.labTestOrderRepository.create(dto);
    return this.labTestOrderRepository.save(order);
  }

  async uploadLabResult(orderId: number, dto: CreateLabResultDto): Promise<LabResult> {
    const result = this.labResultRepository.create({
      ...dto,
      orderId,
    });
    return this.labResultRepository.save(result);
  }

  async getLabHistory(petId: number): Promise<LabTestOrder[]> {
    return this.labTestOrderRepository.find({ where: { petId } });
  }

  async getLabResult(orderId: number): Promise<LabResult> {
    const result = await this.labResultRepository.findOne({ where: { orderId } });
    if (!result) {
      throw new NotFoundException(`Lab result for order ${orderId} not found`);
    }
    return result;
  }

  async getInterpretationGuide(testType: string): Promise<ResultInterpretationGuide> {
    const guide = await this.interpretationGuideRepository.findOne({ where: { testType } });
    if (!guide) {
      throw new NotFoundException(`Interpretation guide for test type ${testType} not found`);
    }
    return guide;
  }

  async generateLabReport(orderId: number): Promise<string> {
    // Logic to generate a report (e.g., PDF) and return the URL
    return `http://example.com/reports/${orderId}`;
  }
} 