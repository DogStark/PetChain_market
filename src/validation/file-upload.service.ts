import { Injectable, BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FileUploadService {
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  async validateFile(file: Express.Multer.File): Promise<void> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File size exceeds limit');
    }

    // Check for malicious content
    await this.scanFile(file);
  }

  private async scanFile(file: Express.Multer.File): Promise<void> {
    // Implement file scanning logic here
    // This could include:
    // - Virus scanning
    // - Malware detection
    // - Content validation
    // For now, we'll just do basic checks
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'].includes(fileExtension)) {
      throw new BadRequestException('Invalid file extension');
    }
  }

  generateSecureFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const hash = createHash('md5')
      .update(originalFilename + timestamp.toString())
      .digest('hex');
    const extension = path.extname(originalFilename);
    return `${hash}${extension}`;
  }

  async saveFile(file: Express.Multer.File, destination: string): Promise<string> {
    const secureFilename = this.generateSecureFilename(file.originalname);
    const filePath = path.join(destination, secureFilename);

    // Ensure the destination directory exists
    await fs.promises.mkdir(destination, { recursive: true });

    // Move the file to the destination
    await fs.promises.writeFile(filePath, file.buffer);

    return secureFilename;
  }
} 