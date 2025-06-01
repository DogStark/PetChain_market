import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Set global prefix
  app.setGlobalPrefix('api');

  const port = process.env['PORT'] || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}/api`);
}

bootstrap().catch(error => {
  console.error('Error starting the application:', error);
  process.exit(1);
});
