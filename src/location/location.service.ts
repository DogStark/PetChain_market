import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly repo: Repository<Location>,
  ) {}

  create(dto: CreateLocationDto) {
    const location = this.repo.create(dto);
    return this.repo.save(location);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateLocationDto) {
    const location = await this.repo.preload({ id, ...dto });
    if (!location) throw new NotFoundException('Location not found');
    return this.repo.save(location);
  }

  async remove(id: number) {
    const location = await this.findOne(id);
    if (!location) throw new NotFoundException('Location not found');
    return this.repo.remove(location);
  }
}
