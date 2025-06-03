import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './pet.entity';
import { Owner } from './owner.entity';
import { PetRepository } from './pet.repository';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetResponseDto } from './dto/pet-response.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class PetService {
  constructor(
    private readonly petRepository: PetRepository,
    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,
  ) {}

  async create(createPetDto: CreatePetDto): Promise<PetResponseDto> {
    // Verify owner exists
    const owner = await this.ownerRepository.findOne({
      where: { id: createPetDto.ownerId }
    });

    if (!owner) {
      throw new NotFoundException(`Owner with ID ${createPetDto.ownerId} not found`);
    }

    const pet = this.petRepository.create(createPetDto);
    const savedPet = await this.petRepository.save(pet);
    
    const petWithOwner = await this.petRepository.findByIdWithOwner(savedPet.id);
    return plainToClass(PetResponseDto, petWithOwner, { excludeExtraneousValues: true });
  }

  async findAll(): Promise<PetResponseDto[]> {
    const pets = await this.petRepository.find({
      relations: ['owner'],
      order: { createdAt: 'DESC' }
    });

    return pets.map(pet => plainToClass(PetResponseDto, pet, { excludeExtraneousValues: true }));
  }

  async findOne(id: number): Promise<PetResponseDto> {
    const pet = await this.petRepository.findByIdWithOwner(id);
    
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }

    return plainToClass(PetResponseDto, pet, { excludeExtraneousValues: true });
  }

  async findByOwner(ownerId: number): Promise<PetResponseDto[]> {
    const pets = await this.petRepository.findByOwnerId(ownerId);
    return pets.map(pet => plainToClass(PetResponseDto, pet, { excludeExtraneousValues: true }));
  }

  async findBySpecies(species: string): Promise<PetResponseDto[]> {
    const pets = await this.petRepository.findBySpecies(species);
    return pets.map(pet => plainToClass(PetResponseDto, pet, { excludeExtraneousValues: true }));
  }

  async update(id: number, updatePetDto: UpdatePetDto): Promise<PetResponseDto> {
    const pet = await this.petRepository.findOne({ where: { id } });
    
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }

    // If updating ownerId, verify the new owner exists
    if (updatePetDto.ownerId && updatePetDto.ownerId !== pet.ownerId) {
      const owner = await this.ownerRepository.findOne({
        where: { id: updatePetDto.ownerId }
      });

      if (!owner) {
        throw new NotFoundException(`Owner with ID ${updatePetDto.ownerId} not found`);
      }
    }

    Object.assign(pet, updatePetDto);
    const updatedPet = await this.petRepository.save(pet);
    
    const petWithOwner = await this.petRepository.findByIdWithOwner(updatedPet.id);
    return plainToClass(PetResponseDto, petWithOwner, { excludeExtraneousValues: true });
  }

  async remove(id: number): Promise<void> {
    const pet = await this.petRepository.findOne({ where: { id } });
    
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }

    await this.petRepository.remove(pet);
  }

  async uploadPhoto(id: number, photoUrl: string): Promise<PetResponseDto> {
    const pet = await this.petRepository.findOne({ where: { id } });
    
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }

    pet.photoUrl = photoUrl;
    const updatedPet = await this.petRepository.save(pet);
    
    const petWithOwner = await this.petRepository.findByIdWithOwner(updatedPet.id);
    return plainToClass(PetResponseDto, petWithOwner, { excludeExtraneousValues: true });
  }
}
