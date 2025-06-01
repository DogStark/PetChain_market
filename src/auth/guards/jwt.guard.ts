import { User } from '../../user/entities/user.entity';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override handleRequest<TUser = User>(
    err: any,
    user: TUser,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (info?.name === 'TokenExpiredError') {
      throw new UnauthorizedException(
        'Token has expired. Please log in again.',
      );
    }

    if (info?.message === 'No auth token') {
      throw new UnauthorizedException('Authentication token missing.');
    }

    if (err || !user) {
      throw new UnauthorizedException('Invalid or malformed token');
    }

    return user;
  }
}
