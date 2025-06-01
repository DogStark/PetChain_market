import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './entities/pet.entity';
import { CreatePetDto } from './dto/create-pet.dto';
import { MedicalRecordService } from '../medical_record/medical_record.service'; // Add this

@Injectable()
export class PetService {
  findOne(id: string) {
    throw new Error('Method not implemented.');
  }
  findAll(query: any) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    private readonly medicalRecordService: MedicalRecordService, // Inject
  ) {}

  async create(createPetDto: CreatePetDto): Promise<Pet> {
    // 1. Save the pet first
    const pet = await this.petRepository.save(createPetDto);

    // 2. Auto-create a basic medical record for dogs/cats
    if (['dog', 'cat'].includes(pet.species.toLowerCase())) {
      await this.medicalRecordService.createInitialRecord(pet.id, {
        vaccinations: this.getDefaultVaccines(pet.species),
        notes: 'Initial checkup scheduled',
      });
    }

    return pet;
  }

  private getDefaultVaccines(species: string): string[] {
    const defaultVaccines = {
      dog: ['Rabies', 'Distemper', 'Parvovirus'],
      cat: ['Rabies', 'Feline Leukemia', 'FVRCP'],
    };
    return defaultVaccines[species.toLowerCase()] || [];
  }
}