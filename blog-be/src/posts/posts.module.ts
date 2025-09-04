import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { RedisModule } from '../common/redis/redis.module';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [RedisModule, AuthModule],
  controllers: [PostsController],
  providers: [PostsService, RolesGuard],
  exports: [PostsService],
})
export class PostsModule {}