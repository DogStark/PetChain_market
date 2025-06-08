import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('NestJS API Documentation')
  .setDescription('Complete API documentation for the NestJS application.')
  .setVersion('1.0.0')
  .addBearerAuth(
    { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
    'JWT-auth'
  )
  .addApiKey(
    { type: 'apiKey', name: 'X-API-KEY', in: 'header' },
    'api-key'
  )
  .addTag('Auth', 'Authentication endpoints')
  .addTag('Users', 'User management endpoints')
  .addTag('App', 'Application health and info')
  .build();