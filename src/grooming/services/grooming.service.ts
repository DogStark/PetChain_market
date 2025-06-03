import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroomingPackage } from '../entities/grooming-package.entity';
import { UpdateGroomingPackageDto } from '../dto/update-grooming-package.dto';
import { CreateGroomingPackageDto } from '../dto/create-grooming-package.dto';

@Injectable()
export class GroomingService {
  constructor(
    @InjectRepository(GroomingPackage)
    private readonly repo: Repository<GroomingPackage>
  ) {}

  async create(dto: CreateGroomingPackageDto): Promise<GroomingPackage> {
    const pkg = this.repo.create(dto);
    return this.repo.save(pkg);
  }

  async findAll(): Promise<GroomingPackage[]> {
    return this.repo.find({ where: { isActive: true } });
  }

  async findOne(id: string): Promise<GroomingPackage> {
    const pkg = await this.repo.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async update(id: string, dto: UpdateGroomingPackageDto): Promise<GroomingPackage> {
    const pkg = await this.findOne(id);
    Object.assign(pkg, dto);
    return this.repo.save(pkg);
  }

  async remove(id: string): Promise<void> {
    const pkg = await this.findOne(id);
    pkg.isActive = false;
    await this.repo.save(pkg);
  }
}
