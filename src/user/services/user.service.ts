import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log(
      'Creating user with DTO:',
      JSON.stringify(createUserDto, null, 2),
    );
    const newUser = this.userRepository.create(createUserDto);
    return this.userRepository.save(newUser);
  }
  async update(id: number, user: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, user);
    return this.userRepository.findOne({ where: { id } });
  }
  async delete(id: number): Promise<void> {
    await this.userRepository.softDelete(id);
  }
  async findAll(): Promise<User[]> {
    return this.userRepository.find({ where: { deletedAt: IsNull() } });
  }
  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}
