import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recording } from './recording.entity';
import { RecordingService } from './recording.service';

@Module({
  imports: [TypeOrmModule.forFeature([Recording])],
  providers: [RecordingService],
  exports: [RecordingService],
})
export class RecordingModule {}
