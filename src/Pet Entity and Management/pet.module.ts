import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { Pet } from './pet.entity';
import { Owner } from './owner.entity';
import { PetRepository } from './pet.repository';
import { mkdirSync } from 'fs';

// Ensure upload directory exists
try {
  mkdirSync('./uploads/pets', { recursive: true });
} catch (error) {
  console.log('Upload directory already exists or could not be created');
}

@Module({
  imports: [
    TypeOrmModule.forFeature([Pet, Owner]),
    MulterModule.register({
      dest: './uploads/pets',
    }),
  ],
  controllers: [PetController],
  providers: [PetService, PetRepository],
  exports: [PetService, PetRepository],
})
export class PetModule {}
