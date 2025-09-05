// redis.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS',
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new IORedis({
          host: config.get('redis.host', '127.0.0.1'),
          port: config.get('redis.port', 6379),
          password: config.get('redis.password'),
        }),
    },
    RedisService
  ],
  exports: ['REDIS', RedisService],
})
export class RedisModule {}
