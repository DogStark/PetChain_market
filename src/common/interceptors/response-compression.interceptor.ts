import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const deflate = promisify(zlib.deflate);
const brotliCompress = promisify(zlib.brotliCompress);

@Injectable()
export class ResponseCompressionInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map(async (data) => {
        // Skip compression for small payloads
        const jsonString = JSON.stringify(data);
        if (jsonString.length < 1024) {
          return data;
        }

        const acceptEncoding = request.headers['accept-encoding'] || '';
        
        try {
          if (acceptEncoding.includes('br')) {
            const compressed = await brotliCompress(jsonString);
            response.setHeader('Content-Encoding', 'br');
            response.setHeader('Content-Type', 'application/json');
            return compressed;
          } else if (acceptEncoding.includes('gzip')) {
            const compressed = await gzip(jsonString);
            response.setHeader('Content-Encoding', 'gzip');
            response.setHeader('Content-Type', 'application/json');
            return compressed;
          } else if (acceptEncoding.includes('deflate')) {
            const compressed = await deflate(jsonString);
            response.setHeader('Content-Encoding', 'deflate');
            response.setHeader('Content-Type', 'application/json');
            return compressed;
          }
        } catch (error) {
          console.error('Compression error:', error);
        }

        return data;
      }),
    );
  }
}