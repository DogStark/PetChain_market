import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consultation } from './consultation.entity';
import { Pricing } from './pricing.entity';
import { CreateConsultationDto, UpdateConsultationDto } from './dto';

@Injectable()
export class ConsultationService {
  constructor(
    @InjectRepository(Consultation)
    private consultationRepo: Repository<Consultation>,
    @InjectRepository(Pricing)
    private pricingRepo: Repository<Pricing>,
  ) {}

  async listAll(): Promise<Consultation[]> {
    return this.consultationRepo.find({ relations: ['pricing', 'recording'] });
  }

  async getOne(id: string): Promise<Consultation> {
    const consult = await this.consultationRepo.findOne({ where: { id } });
    if (!consult) throw new NotFoundException('Consultation not found');
    return consult;
  }

  async create(dto: CreateConsultationDto): Promise<Consultation> {
    const pricing = await this.pricingRepo.findOneBy({ id: dto.pricingId });
    if (!pricing) throw new NotFoundException('Pricing plan not found');
    const consult = this.consultationRepo.create({
      patientName: dto.patientName,
      doctorName: dto.doctorName,
      scheduledAt: new Date(dto.scheduledAt),
      pricing,
    });
    return this.consultationRepo.save(consult);
  }

  async update(
    id: string,
    dto: UpdateConsultationDto,
  ): Promise<Consultation> {
    const consult = await this.getOne(id);
    if (dto.completed !== undefined) consult.completed = dto.completed;
    return this.consultationRepo.save(consult);
  }
}
