import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CompressionMiddleware } from './common/middleware/compression.middleware';
import { ResponseOptimizationFilter } from './common/filters/response-optimization.filter';
import helmet from 'helmet';


async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.use(helmet({
    contentSecurityPolicy: false, 
  }));

  app.enableCors({
    origin: process.env['ALLOWED_ORIGINS']?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400, 
  });


  const compressionMiddleware = new CompressionMiddleware();
  app.use(compressionMiddleware.use.bind(compressionMiddleware));

  app.useGlobalFilters(new ResponseOptimizationFilter());

  app.use((req: any, res: { setHeader: (arg0: string, arg1: string | boolean) => void; getHeader: (arg0: string) => string | string[]; }, next: () => void) => {
   
    res.setHeader('ETag', true);
    

    if (res.getHeader('content-type')?.includes('application/json')) {
      res.setHeader('Cache-Control', 'public, max-age=300'); 
    }

    next();
  });

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
