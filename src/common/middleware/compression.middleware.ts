import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as compression from 'compression';

@Injectable()
export class CompressionMiddleware implements NestMiddleware {
  private compressionHandler = compression({
    level: 6, 
    threshold: 1024, 
    filter: (req: Request, res: Response) => {
      if (req.headers['x-no-compression']) {
        return false;
      }

      const contentType = res.getHeader('content-type') as string;
      if (contentType) {
        const skipTypes = [
          'image/',
          'video/',
          'audio/',
          'application/zip',
          'application/gzip',
          'application/pdf'
        ];
        
        if (skipTypes.some(type => contentType.startsWith(type))) {
          return false;
        }
      }

      return compression.filter(req, res);
    },
  });

  use(req: Request, res: Response, next: NextFunction) {
    this.compressionHandler(req, res, next);
  }
}
