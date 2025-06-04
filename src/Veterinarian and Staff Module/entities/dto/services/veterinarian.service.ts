import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Veterinarian } from '../entities/veterinarian.entity';
import { Specialization } from '../entities/specialization.entity';
import { CreateVeterinarianDto } from '../dto/create-veterinarian.dto';

@Injectable()
export class VeterinarianService {
  constructor(
    @InjectRepository(Veterinarian)
    private veterinarianRepository: Repository<Veterinarian>,
    @InjectRepository(Specialization)
    private specializationRepository: Repository<Specialization>,
  ) {}

  async create(createVeterinarianDto: CreateVeterinarianDto): Promise<Veterinarian> {
    const existingVet = await this.veterinarianRepository.findOne({
      where: { email: createVeterinarianDto.email }
    });

    if (existingVet) {
      throw new ConflictException('Veterinarian with this email already exists');
    }

    const veterinarian = this.veterinarianRepository.create(createVeterinarianDto);
    
    if (createVeterinarianDto.specializationIds?.length) {
      const specializations = await this.specializationRepository.findBy({
        id: In(createVeterinarianDto.specializationIds)
      });
      veterinarian.specializations = specializations;
    }

    return this.veterinarianRepository.save(veterinarian);
  }

  async findAll(): Promise<Veterinarian[]> {
    return this.veterinarianRepository.find({
      relations: ['specializations', 'credentials', 'availabilitySchedules']
    });
  }

  async findOne(id: number): Promise<Veterinarian> {
    const veterinarian = await this.veterinarianRepository.findOne({
      where: { id },
      relations: ['specializations', 'credentials', 'availabilitySchedules']
    });

    if (!veterinarian) {
      throw new NotFoundException(`Veterinarian with ID ${id} not found`);
    }

    return veterinarian;
  }

  async findBySpecialization(specializationId: number): Promise<Veterinarian[]> {
    return this.veterinarianRepository
      .createQueryBuilder('vet')
      .leftJoinAndSelect('vet.specializations', 'spec')
      .leftJoinAndSelect('vet.credentials', 'cred')
      .leftJoinAndSelect('vet.availabilitySchedules', 'schedule')
      .where('spec.id = :specializationId', { specializationId })
      .getMany();
  }

  async getProfile(id: number): Promise<Veterinarian> {
    const veterinarian = await this.findOne(id);
    return veterinarian;
  }

  async updateProfile(id: number, updateData: Partial<CreateVeterinarianDto>): Promise<Veterinarian> {
    const veterinarian = await this.findOne(id);
    
    if (updateData.specializationIds?.length) {
      const specializations = await this.specializationRepository.findBy({
        id: In(updateData.specializationIds)
      });
      veterinarian.specializations = specializations;
    }

    Object.assign(veterinarian, updateData);
    return this.veterinarianRepository.save(veterinarian);
  }

  async remove(id: number): Promise<void> {
    const veterinarian = await this.findOne(id);
    await this.veterinarianRepository.remove(veterinarian);
  }
}