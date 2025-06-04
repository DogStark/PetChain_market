import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { API_VERSION } from './api-version.decorator';

@Injectable()
export class ApiVersionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const version = this.reflector.get<number>(API_VERSION, context.getHandler());
    if (!version) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const clientVersion = this.getClientVersion(request);

    return clientVersion >= version;
  }

  private getClientVersion(request: any): number {
    // Get version from header
    const versionHeader = request.headers['x-api-version'];
    if (versionHeader) {
      return parseInt(versionHeader, 10);
    }

    // Get version from query parameter
    const versionQuery = request.query.version;
    if (versionQuery) {
      return parseInt(versionQuery, 10);
    }

    // Default to version 1 if no version specified
    return 1;
  }
} 