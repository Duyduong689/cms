import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RedisModule } from '../common/redis/redis.module';
import { MailService } from './mail/mail.service';
import authConfig from '../config/auth.config';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    PassportModule.register({ defaultStrategy: 'jwt-access' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        // Default secret for access tokens - TokenUtil will handle refresh tokens separately
        secret: configService.get<string>('auth.jwt.accessSecret'),
        signOptions: {
          expiresIn: configService.get<string>('auth.jwt.accessExpires'),
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    MailService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    JwtAccessGuard,
    JwtRefreshGuard,
  ],
  exports: [AuthService, JwtAccessGuard, JwtRefreshGuard],
})
export class AuthModule {}
