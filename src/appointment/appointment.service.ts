import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Location } from '@/location/entities/location.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
  ) {}

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    const location = await this.locationRepo.findOneBy({ id: dto.locationId });
    if (!location) throw new NotFoundException('Location not found');

    const appointment = this.appointmentRepo.create({
      patientName: dto.patientName,
      serviceType: dto.serviceType,
      scheduledAt: new Date(dto.scheduledAt),
      location,
    });

    return this.appointmentRepo.save(appointment);
  }

  findAll(): Promise<Appointment[]> {
    return this.appointmentRepo.find({ relations: ['location'] });
  }

  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: ['location'],
    });

    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async update(id: number, dto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);

    if (dto.locationId) {
      const location = await this.locationRepo.findOneBy({ id: dto.locationId });
      if (!location) throw new NotFoundException('Location not found');
      appointment.location = location;
    }

    Object.assign(appointment, dto);
    return this.appointmentRepo.save(appointment);
  }

  async remove(id: number): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentRepo.remove(appointment);
  }
}
