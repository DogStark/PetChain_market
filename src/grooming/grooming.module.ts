import { Module } from '@nestjs/common';
import { GroomingPackage } from './entities/grooming-package.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroomingController } from './controllers/grooming.controller';
import { GroomingService } from './services/grooming.service';

@Module({
    imports: [TypeOrmModule.forFeature([GroomingPackage])],
  controllers: [GroomingController],
  providers: [GroomingService],
})
export class GroomingModule {}
