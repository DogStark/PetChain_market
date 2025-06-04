# NestJS Validation Module

A comprehensive validation and sanitization module for NestJS applications that provides:

- Input validation for all endpoints
- Data sanitization
- File upload security
- SQL injection prevention
- XSS protection
- Validation error handling

## Installation

1. Copy the `validation` folder to your NestJS project's `src/common` directory
2. Install the required dependencies:
```bash
npm install class-validator class-transformer sanitize-html xss
```

## Usage

1. Import the ValidationModule in your AppModule:

```typescript
import { ValidationModule } from './common/validation/validation.module';

@Module({
  imports: [ValidationModule],
  // ...
})
export class AppModule {}
```

2. Use the CustomValidationPipe in your controllers:

```typescript
import { CustomValidationPipe } from './common/validation/validation.pipe';

@Controller('example')
export class ExampleController {
  @Post()
  @UsePipes(new CustomValidationPipe())
  async create(@Body() createDto: CreateDto) {
    // Your code here
  }
}
```

3. Use the SanitizationService for data sanitization:

```typescript
import { SanitizationService } from './common/validation/sanitization.service';

@Controller('example')
export class ExampleController {
  constructor(private sanitizationService: SanitizationService) {}

  @Post()
  async create(@Body() data: any) {
    const sanitizedData = this.sanitizationService.sanitizeObject(data);
    // Use sanitizedData
  }
}
```

4. Use the FileUploadService for secure file uploads:

```typescript
import { FileUploadService } from './common/validation/file-upload.service';

@Controller('example')
export class ExampleController {
  constructor(private fileUploadService: FileUploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    await this.fileUploadService.validateFile(file);
    const filename = await this.fileUploadService.saveFile(file, './uploads');
    return { filename };
  }
}
```

## Features

### Input Validation
- Uses class-validator for DTO validation
- Custom validation pipe with error formatting
- Type-safe validation

### Data Sanitization
- HTML sanitization
- XSS protection
- Object sanitization

### File Upload Security
- MIME type validation
- File size limits
- Secure filename generation
- Basic file scanning
- Extension validation

### Error Handling
- Secure error messages
- No information leakage
- Structured error responses

## Security Considerations

1. Always validate input before processing
2. Sanitize all user-generated content
3. Use secure file upload practices
4. Implement proper error handling
5. Keep dependencies updated

## Contributing

Feel free to submit issues and enhancement requests! 