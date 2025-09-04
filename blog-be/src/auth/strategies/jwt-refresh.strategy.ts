import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload } from '../../common/utils/token.util';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refreshToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.jwt.refreshSecret'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Verify token type
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    if (!payload.jti) {
      throw new UnauthorizedException('Missing JTI in refresh token');
    }

    // Check if refresh session exists in Redis
    const refreshPrefix = this.configService.get<string>('auth.auth.refreshPrefix');
    const sessionKey = `${refreshPrefix}${payload.jti}`;
    const sessionUserId = await this.redis.get(sessionKey);

    if (!sessionUserId || sessionUserId !== payload.sub) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Check if user still exists and is active
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is disabled');
    }

    // Return the payload with current user data
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'refresh',
      jti: payload.jti,
    };
  }
}
