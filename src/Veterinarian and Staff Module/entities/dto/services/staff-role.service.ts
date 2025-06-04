import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffRole } from '../entities/staff-role.entity';
import { CreateStaffRoleDto } from '../dto/create-staff-role.dto';

@Injectable()
export class StaffRoleService {
  constructor(
    @InjectRepository(StaffRole)
    private roleRepository: Repository<StaffRole>,
  ) {}

  async create(createRoleDto: CreateStaffRoleDto): Promise<StaffRole> {
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name }
    });

    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  async findAll(): Promise<StaffRole[]> {
    return this.roleRepository.find();
  }

  async findOne(id: number): Promise<StaffRole> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['staff']
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async update(id: number, updateData: Partial<CreateStaffRoleDto>): Promise<StaffRole> {
    const role = await this.findOne(id);
    Object.assign(role, updateData);
    return this.roleRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['staff']
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    if (role.staff && role.staff.length > 0) {
      throw new ConflictException('Cannot delete role that has assigned staff members');
    }

    await this.roleRepository.remove(role);
  }
}