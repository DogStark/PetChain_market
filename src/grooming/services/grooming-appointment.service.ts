import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { CreateGroomingAppointmentDto, UpdateGroomingAppointmentDto } from './dto';
import { GroomingAppointment } from '../entities/grooming-appointment.entity';
import { UpdateGroomingAppointmentDto } from '../dto/update-grooming-appointment.dto';

@Injectable()
export class GroomingAppointmentService {
  constructor(
    @InjectRepository(GroomingAppointment)
    private readonly repo: Repository<GroomingAppointment>,
  ) {}

//   async create(dto: CreateGroomingAppointmentDto): Promise<GroomingAppointment> {
//     const appointment = this.repo.create(dto);
//     return this.repo.save(appointment);
//   }

  async findAll(): Promise<GroomingAppointment[]> {
    return this.repo.find({ relations: ['package'] });
  }

  async findOne(id: string): Promise<GroomingAppointment> {
    const appointment = await this.repo.findOne({ where: { id }, relations: ['package'] });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async update(id: string, dto: UpdateGroomingAppointmentDto): Promise<GroomingAppointment> {
    const appointment = await this.findOne(id);
    Object.assign(appointment, dto);
    return this.repo.save(appointment);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
