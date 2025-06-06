import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CompressionMiddleware } from './common/middleware/compression.middleware';
import { ResponseOptimizationFilter } from './common/filters/response-optimization.filter';
import { ApiKeyMiddleware } from './common/middleware/api-key.middleware';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import * as hpp from 'hpp';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Protect secure routes with API key middleware
  const apiKeyMiddleware = new ApiKeyMiddleware();
  app.use('/api/secure', apiKeyMiddleware.use.bind(apiKeyMiddleware));

  // Helmet - Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  app.use(hpp());

  // General rate limiter
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 15 * 60,
      },
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Speed limiter
  app.use(
    slowDown({
      windowMs: 15 * 60 * 1000,
      delayAfter: 2,
      delayMs: 500,
    }),
  );

  // Auth-specific stricter rate limiting
  app.use(
    '/api/auth',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: {
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: 15 * 60,
      },
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Global validation & sanitization
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validateCustomDecorators: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  // CORS
  app.enableCors({
    origin: function (origin, callback) {
      const allowedOrigins = process.env['ALLOWED_ORIGINS']?.split(',') || [
        'http://localhost:3000',
        'http://localhost:3001',
      ];
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV === 'development'
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
  });

  // Compression
  const compressionMiddleware = new CompressionMiddleware();
  app.use(compressionMiddleware.use.bind(compressionMiddleware));

  // Global filter
  app.useGlobalFilters(new ResponseOptimizationFilter());

  // Extra security + caching headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('ETag', true);

    if (
      res.getHeader('content-type')?.toString().includes('application/json')
    ) {
      res.setHeader('Cache-Control', 'private, max-age=300');
    } else {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    next();
  });

  // Prefix
  app.setGlobalPrefix('api');

  const port = process.env['PORT'] || 3000;
  await app.listen(port);

  console.log(`🚀 App running: http://localhost:${port}/api`);
  console.log(`🔒 Security measures activated`);
}

bootstrap().catch(error => {
  console.error('❌ Error starting the app:', error);
  process.exit(1);
});
