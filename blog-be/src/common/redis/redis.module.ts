// redis.module.ts
import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import type { redisStore } from 'cache-manager-redis-yet';
import { ConfigModule, ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        store: (await import('cache-manager-redis-yet')).redisStore as typeof redisStore,
        socket: {
          host: config.get<string>('redis.host', '127.0.0.1'),
          port: config.get<number>('redis.port', 6379),
        },
        ttl: config.get<number>('redis.ttl', 60), // seconds
        max: config.get<number>('redis.max', 1000), // max keys in memory
      }),
      inject: [ConfigService],
    }),
  ],
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
  exports: ['REDIS', CacheModule, RedisService],
})
export class RedisModule {}
