import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../entities/staff.entity';
import { CreateStaffDto } from '../dto/create-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

  async create(createStaffDto: CreateStaffDto): Promise<Staff> {
    const existingStaff = await this.staffRepository.findOne({
      where: { email: createStaffDto.email }
    });

    if (existingStaff) {
      throw new ConflictException('Staff member with this email already exists');
    }

    const staff = this.staffRepository.create(createStaffDto);
    return this.staffRepository.save(staff);
  }

  async findAll(): Promise<Staff[]> {
    return this.staffRepository.find({
      relations: ['role']
    });
  }

  async findOne(id: number): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: { id },
      relations: ['role']
    });

    if (!staff) {
      throw new NotFoundException(`Staff member with ID ${id} not found`);
    }

    return staff;
  }

  async findByRole(roleId: number): Promise<Staff[]> {
    return this.staffRepository.find({
      where: { roleId },
      relations: ['role']
    });
  }

  async update(id: number, updateData: Partial<CreateStaffDto>): Promise<Staff> {
    const staff = await this.findOne(id);
    Object.assign(staff, updateData);
    return this.staffRepository.save(staff);
  }

  async remove(id: number): Promise<void> {
    const staff = await this.findOne(id);
    await this.staffRepository.remove(staff);
  }
}
