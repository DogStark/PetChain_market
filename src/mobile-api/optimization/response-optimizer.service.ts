import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as compression from 'compression';
import * as zlib from 'zlib';

@Injectable()
export class ResponseOptimizerService {
  private readonly compressionOptions = {
    level: zlib.Z_BEST_COMPRESSION,
    threshold: 1024, // Only compress responses larger than 1KB
  };

  constructor() {
    this.compressionMiddleware = compression(this.compressionOptions);
  }

  private readonly compressionMiddleware: any;

  optimizeResponse(response: Response, data: any): void {
    // Add mobile-specific headers
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Cache-Control', 'private, max-age=300'); // 5 minutes cache

    // Apply compression
    this.compressionMiddleware(response.req, response, () => {
      // Optimize the response data
      const optimizedData = this.optimizeData(data);
      response.json(optimizedData);
    });
  }

  private optimizeData(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.optimizeData(item));
    }

    if (typeof data === 'object' && data !== null) {
      const optimized: any = {};

      for (const [key, value] of Object.entries(data)) {
        // Skip null or undefined values
        if (value == null) continue;

        // Skip empty arrays
        if (Array.isArray(value) && value.length === 0) continue;

        // Skip empty objects
        if (typeof value === 'object' && Object.keys(value).length === 0) continue;

        // Recursively optimize nested objects
        optimized[key] = this.optimizeData(value);
      }

      return optimized;
    }

    return data;
  }

  setCacheHeaders(response: Response, maxAge: number = 300): void {
    response.setHeader('Cache-Control', `private, max-age=${maxAge}`);
    response.setHeader('ETag', this.generateETag(response));
  }

  private generateETag(response: Response): string {
    const content = JSON.stringify(response.locals.data);
    return `"${Buffer.from(content).toString('base64')}"`;
  }

  compressImage(imageBuffer: Buffer, quality: number = 80): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const sharp = require('sharp');
      sharp(imageBuffer)
        .jpeg({ quality })
        .toBuffer()
        .then(resolve)
        .catch(reject);
    });
  }
} 