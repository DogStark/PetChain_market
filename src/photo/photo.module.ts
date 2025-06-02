import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Photo } from './entities/photo.entity';
import { PhotosController } from './photo.controller';
import { PhotosService } from './photo.service';
import { PetModule } from '@/pet/pet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Photo]),
    PetModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [PhotosController],
  providers: [PhotosService],
})
export class PhotoModule {}
