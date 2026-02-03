import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  userId?: string;
  sub?: string;
  email?: string;
}

interface ValidatedUser {
  id: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  validate(payload: JwtPayload): ValidatedUser {
    if (!payload.userId && !payload.sub) {
      throw new UnauthorizedException('Token inválido');
    }

    // Retornar el usuario que se adjuntará al request
    return {
      id: (payload.userId || payload.sub) as string,
      email: payload.email as string,
    };
  }
}
