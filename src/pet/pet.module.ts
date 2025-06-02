import { Module } from '@nestjs/common';
import { PetService } from './pet.service';
import { PetController } from '@/common/interceptors/cache.interceptor';
import { User } from '@/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pet } from './entities/pet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pet, User])],
  controllers: [PetController],
  exports: [PetService],
  providers: [PetService],
})
export class PetModule {}
