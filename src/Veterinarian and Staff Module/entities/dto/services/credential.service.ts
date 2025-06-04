import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credential } from '../entities/credential.entity';
import { CreateCredentialDto } from '../dto/create-credential.dto';

@Injectable()
export class CredentialService {
  constructor(
    @InjectRepository(Credential)
    private credentialRepository: Repository<Credential>,
  ) {}

  async create(createCredentialDto: CreateCredentialDto): Promise<Credential> {
    const credential = this.credentialRepository.create(createCredentialDto);
    return this.credentialRepository.save(credential);
  }

  async findByVeterinarian(veterinarianId: number): Promise<Credential[]> {
    return this.credentialRepository.find({
      where: { veterinarianId }
    });
  }

  async findExpiringCredentials(daysAhead: number = 30): Promise<Credential[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.credentialRepository
      .createQueryBuilder('credential')
      .leftJoinAndSelect('credential.veterinarian', 'veterinarian')
      .where('credential.expirationDate <= :futureDate', { futureDate })
      .andWhere('credential.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async update(id: number, updateData: Partial<CreateCredentialDto>): Promise<Credential> {
    const credential = await this.credentialRepository.findOne({ where: { id } });
    if (!credential) {
      throw new NotFoundException(`Credential with ID ${id} not found`);
    }

    Object.assign(credential, updateData);
    return this.credentialRepository.save(credential);
  }

  async remove(id: number): Promise<void> {
    const result = await this.credentialRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Credential with ID ${id} not found`);
    }
  }
}