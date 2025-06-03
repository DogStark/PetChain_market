import { Module, Global } from '@nestjs/common';
import { CustomValidationPipe } from './validation.pipe';
import { SanitizationService } from './sanitization.service';
import { FileUploadService } from './file-upload.service';

@Global()
@Module({
  providers: [
    CustomValidationPipe,
    SanitizationService,
    FileUploadService
  ],
  exports: [
    CustomValidationPipe,
    SanitizationService,
    FileUploadService
  ]
})
export class ValidationModule {} 