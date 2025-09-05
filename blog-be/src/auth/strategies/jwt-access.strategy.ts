import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload } from '../../common/utils/token.util';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.accessToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.jwt.accessSecret'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Verify token type
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Verify sessionId is present
    if (!payload.sid) {
      throw new UnauthorizedException('Missing session ID in token');
    }

    // Check if session exists (primary validation)
    const sessionPrefix = this.configService.get<string>('auth.auth.sessionPrefix');
    const sessionExists = await this.redis.exists(`${sessionPrefix}${payload.sid}`);
    if (!sessionExists) {
      throw new UnauthorizedException('Session revoked');
    }

    // Check if token is in blocklist (secondary validation)
    if (payload.jti) {
      const blockedPrefix = this.configService.get<string>('auth.auth.blockedPrefix');
      const isBlocked = await this.redis.get(`${blockedPrefix}${payload.jti}`);
      if (isBlocked) {
        throw new UnauthorizedException('Token has been revoked');
      }
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
      type: 'access',
      sid: payload.sid,
      jti: payload.jti,
    };
  }
}
