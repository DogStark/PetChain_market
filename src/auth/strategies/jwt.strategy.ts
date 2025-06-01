import { User } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env['JWT_SECRET'] || 'defaultSecretKey',
    });
  }

  validate(payload: User) {
    // payload contains whatever we put into JWT sign() (email, sub, role)
    return { userId: payload.id, email: payload.email, role: payload.role };
  }
}
