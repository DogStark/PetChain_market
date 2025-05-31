import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ResponseOptimizationFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...(exception instanceof HttpException
        ? (() => {
            const res = exception.getResponse();
            return typeof res === 'object' && res !== null ? res : {};
          })()
        : {}
      ),
    };

    response
      .status(status)
      .setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      .setHeader('Pragma', 'no-cache')
      .setHeader('Expires', '0')
      .json(this.optimizeResponse(errorResponse));
  }

  private optimizeResponse(response: any): any {
    const optimized = { ...response };
    
    if (process.env['NODE_ENV'] === 'production') {
      delete optimized.stack;
      delete optimized.trace;
    }

    return optimized;
  }
}
