import { Injectable } from '@nestjs/common';
import { CreateTelemedicineDto } from '../dto/create-telemedicine.dto';
import { UpdateTelemedicineDto } from '../dto/update-telemedicine.dto';

@Injectable()
export class TelemedicineService {
  create(createTelemedicineDto: CreateTelemedicineDto) {
    return 'This action adds a new telemedicine';
  }

  findAll() {
    return `This action returns all telemedicine`;
  }

  findOne(id: number) {
    return `This action returns a #${id} telemedicine`;
  }

  update(id: number, updateTelemedicineDto: UpdateTelemedicineDto) {
    return `This action updates a #${id} telemedicine`;
  }

  remove(id: number) {
    return `This action removes a #${id} telemedicine`;
  }
}
