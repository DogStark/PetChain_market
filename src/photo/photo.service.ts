import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './entities/photo.entity';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { PetService } from '@/pet/pet.service';

@Injectable()
export class PhotosService {
  private readonly uploadPath = './uploads/photos';
  private readonly thumbnailPath = './uploads/thumbnails';

  constructor(
    @InjectRepository(Photo)
    private photoRepository: Repository<Photo>,
    private petsService: PetService,
  ) {
    // Ensure upload directories exist
    [this.uploadPath, this.thumbnailPath].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async upload(
    file: Express.Multer.File,
    petId: string,
    userId: string,
    caption?: string,
  ): Promise<Photo> {
    // Verify user has access to the pet
    await this.petsService.findOne(petId, userId);

    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!file || !file.mimetype || !allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only images are allowed.',
      );
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const filename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadPath, filename);
    const thumbnailFilename = `thumb_${filename}`;
    const thumbnailPath = path.join(this.thumbnailPath, thumbnailFilename);

    try {
      // Save original file
      await fs.promises.writeFile(filePath, file.buffer);

      // Generate thumbnail
      await sharp(file.buffer)
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      // Save photo record
      const photo = this.photoRepository.create({
        filename,
        originalName: file?.originalname ?? 'unnamed',
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/photos/${filename}`,
        thumbnailUrl: `/uploads/thumbnails/${thumbnailFilename}`,
        caption,
        petId,
        uploadedById: userId,
      });

      return this.photoRepository.save(photo);
    } catch (error) {
      // Clean up files if database save fails
      try {
        await fs.promises.unlink(filePath);
        await fs.promises.unlink(thumbnailPath);
      } catch {}
      throw error;
    }
  }

  async findByPet(petId: string, userId: string): Promise<Photo[]> {
    // Verify user has access to the pet
    await this.petsService.findOne(petId, userId);

    return this.photoRepository.find({
      where: { petId },
      order: { createdAt: 'DESC' },
      relations: ['uploadedBy'],
    });
  }

  async setProfilePhoto(
    photoId: string,
    petId: string,
    userId: string,
  ): Promise<Photo> {
    // Verify user has access to the pet
    const pet = await this.petsService.findOne(petId, userId);

    // Remove current profile photo status
    await this.photoRepository.update(
      { petId, isProfilePhoto: true },
      { isProfilePhoto: false },
    );

    // Set new profile photo
    const photo = await this.photoRepository.findOne({
      where: { id: photoId, petId },
    });
    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    photo.isProfilePhoto = true;
    return this.photoRepository.save(photo);
  }

  async delete(photoId: string, userId: string): Promise<void> {
    const photo = await this.photoRepository.findOne({
      where: { id: photoId },
      relations: ['pet'],
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Verify user has access to the pet
    await this.petsService.findOne(photo.petId, userId);

    try {
      // Delete files
      const filePath = path.join(this.uploadPath, photo.filename);
      const thumbnailPath = path.join(
        this.thumbnailPath,
        `thumb_${photo.filename}`,
      );

      await Promise.all([
        fs.promises.unlink(filePath).catch(() => {}),
        fs.promises.unlink(thumbnailPath).catch(() => {}),
      ]);

      // Delete database record
      await this.photoRepository.remove(photo);
    } catch (error) {
      throw new BadRequestException('Failed to delete photo');
    }
  }
}
