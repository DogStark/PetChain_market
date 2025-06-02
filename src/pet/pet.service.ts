import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Pet } from './entities/pet.entity';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { SearchPetsDto } from './dto/search-pets.dto';
import { User } from '@/user/entities/user.entity';

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createPetDto: CreatePetDto, ownerId: string): Promise<Pet> {
    const pet = this.petRepository.create({
      ...createPetDto,
      ownerId,
      birthDate: new Date(createPetDto.birthDate),
    });

    if (
      createPetDto.familyMemberIds &&
      createPetDto.familyMemberIds.length > 0
    ) {
      const familyMembers = await this.userRepository.findByIds(
        createPetDto.familyMemberIds,
      );
      pet.familyMembers = familyMembers;
    }

    return this.petRepository.save(pet);
  }

  async findAll(searchDto: SearchPetsDto, userId: string) {
    const queryBuilder = this.petRepository
      .createQueryBuilder('pet')
      .leftJoinAndSelect('pet.owner', 'owner')
      .leftJoinAndSelect('pet.familyMembers', 'familyMembers')
      .leftJoinAndSelect('pet.photos', 'photos')
      .where('(pet.ownerId = :userId OR familyMembers.id = :userId)', {
        userId,
      })
      .andWhere('pet.isActive = :isActive', { isActive: true });

    this.applyFilters(queryBuilder, searchDto);
    this.applySorting(queryBuilder, searchDto);

    const page = searchDto.page ?? 1;
    const [pets, total] = await queryBuilder
      .skip((page - 1) * (searchDto.limit ?? 10))
      .take(searchDto.limit ?? 10)
      .getManyAndCount();

    return {
      pets,
      total,
      page: searchDto.page,
      pages: Math.ceil(total / (searchDto.limit ?? 10)),
    };
  }

  async findOne(id: string, userId: string): Promise<Pet> {
    const pet = await this.petRepository
      .createQueryBuilder('pet')
      .leftJoinAndSelect('pet.owner', 'owner')
      .leftJoinAndSelect('pet.familyMembers', 'familyMembers')
      .leftJoinAndSelect('pet.photos', 'photos')
      .where('pet.id = :id', { id })
      .andWhere('(pet.ownerId = :userId OR familyMembers.id = :userId)', {
        userId,
      })
      .getOne();

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    return pet;
  }

  async update(
    id: string,
    updatePetDto: UpdatePetDto,
    userId: string,
  ): Promise<Pet> {
    const pet = await this.findOne(id, userId);

    if (pet.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can update pet details');
    }

    if (updatePetDto.birthDate) {
      updatePetDto.birthDate = new Date(updatePetDto.birthDate);
    }

    if (updatePetDto.familyMemberIds) {
      const familyMembers = await this.userRepository.findByIds(
        updatePetDto.familyMemberIds,
      );
      pet.familyMembers = familyMembers;
    }

    Object.assign(pet, updatePetDto);
    return this.petRepository.save(pet);
  }

  async remove(id: string, userId: string): Promise<void> {
    const pet = await this.findOne(id, userId);

    if (pet.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can delete the pet');
    }

    pet.isActive = false;
    await this.petRepository.save(pet);
  }

  async addFamilyMember(
    petId: string,
    familyMemberId: string,
    userId: string,
  ): Promise<Pet> {
    const pet = await this.findOne(petId, userId);

    if (pet.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can add family members');
    }

    const familyMember = await this.userRepository.findOne({
      where: { id: parseInt(familyMemberId, 10) },
    });
    if (!familyMember) {
      throw new NotFoundException('Family member not found');
    }

    if (!pet.familyMembers) {
      pet.familyMembers = [];
    }

    const alreadyAdded = pet.familyMembers.some(
      member => member.id === parseInt(familyMemberId, 10),
    );
    if (!alreadyAdded) {
      pet.familyMembers.push(familyMember);
      await this.petRepository.save(pet);
    }

    return pet;
  }

  async removeFamilyMember(
    petId: string,
    familyMemberId: string,
    userId: string,
  ): Promise<Pet> {
    const pet = await this.findOne(petId, userId);

    if (pet.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can remove family members');
    }

    pet.familyMembers = pet.familyMembers.filter(
      member => member.id !== parseInt(familyMemberId, 10),
    );
    return this.petRepository.save(pet);
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Pet>,
    searchDto: SearchPetsDto,
  ) {
    if (searchDto.search) {
      queryBuilder.andWhere(
        '(pet.name ILIKE :search OR pet.breed ILIKE :search OR pet.description ILIKE :search)',
        { search: `%${searchDto.search}%` },
      );
    }

    if (searchDto.species) {
      queryBuilder.andWhere('pet.species = :species', {
        species: searchDto.species,
      });
    }

    if (searchDto.breed) {
      queryBuilder.andWhere('pet.breed = :breed', { breed: searchDto.breed });
    }

    if (searchDto.gender) {
      queryBuilder.andWhere('pet.gender = :gender', {
        gender: searchDto.gender,
      });
    }
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Pet>,
    searchDto: SearchPetsDto,
  ) {
    const allowedSortFields = [
      'name',
      'species',
      'breed',
      'birthDate',
      'createdAt',
    ];
    const sortField =
      searchDto.sortBy && allowedSortFields.includes(searchDto.sortBy)
        ? searchDto.sortBy
        : 'createdAt';

    queryBuilder.orderBy(`pet.${sortField}`, searchDto.sortOrder);
  }
}
