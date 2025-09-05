import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RedisModule,
    PostsModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
