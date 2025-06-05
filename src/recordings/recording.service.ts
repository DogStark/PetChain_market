import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recording } from './recording.entity';

@Injectable()
export class RecordingService {
  constructor(
    @InjectRepository(Recording)
    private recordingRepo: Repository<Recording>,
  ) {}

  async upload(fileUrl: string): Promise<Recording> {
    const rec = this.recordingRepo.create({ fileUrl });
    return this.recordingRepo.save(rec);
  }

  async findAll(): Promise<Recording[]> {
    return this.recordingRepo.find();
  }

  async getOne(id: string): Promise<Recording> {
    const rec = await this.recordingRepo.findOneBy({ id });
    if (!rec) throw new NotFoundException('Recording not found');
    return rec;
  }
}
