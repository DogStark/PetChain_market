import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Pet } from './pet.entity';

@Injectable()
export class PetRepository extends Repository<Pet> {
  constructor(private dataSource: DataSource) {
    super(Pet, dataSource.createEntityManager());
  }

  async findByOwnerId(ownerId: number): Promise<Pet[]> {
    return this.find({
      where: { ownerId },
      relations: ['owner'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByIdWithOwner(id: number): Promise<Pet | null> {
    return this.findOne({
      where: { id },
      relations: ['owner']
    });
  }

  async findBySpecies(species: string): Promise<Pet[]> {
    return this.find({
      where: { species },
      relations: ['owner'],
      order: { name: 'ASC' }
    });
  }
}
