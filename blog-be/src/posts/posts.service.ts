import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PostsService {
  private readonly CACHE_TTL = 60 * 5; // 5 minutes
  private readonly CACHE_PREFIX = 'posts';

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private configService: ConfigService,
  ) {}

  async create(createPostDto: CreatePostDto) {
    // Create a copy of the DTO to avoid modifying the original
    const { title, slug, ...restData } = createPostDto;
    
    // Ensure slug is always defined (required by Prisma schema)
    const finalSlug = slug || this.slugify(title);

    const post = await this.prisma.post.create({
      data: {
        title,
        slug: finalSlug,
        ...restData,
      },
    });

    // Invalidate all list caches when new post is created
    await this.redis.delByPattern(`${this.CACHE_PREFIX}:list*`);

    return post;
  }

  async findAll(query: QueryPostDto) {
    const cacheKey = this.redis.generateKey(`${this.CACHE_PREFIX}:list`, query);
    
    // Try to get from cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return cached;
    }

    const { q, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};
    
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
      ];
    }
    
    if (status) {
      where.status = status;
    }

    // Get total count for pagination
    const total = await this.prisma.post.count({ where });
    
    // Get posts with pagination
    const items = await this.prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });

    const result = {
      items,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };

    // Cache the result
    await this.redis.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  async findOne(id: string) {
    const cacheKey = this.redis.generateKey(`${this.CACHE_PREFIX}:item`, { id });
    
    // Try to get from cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return cached;
    }

    const post = await this.prisma.post.findUnique({ where: { id } });
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Cache the post
    await this.redis.set(cacheKey, post, this.CACHE_TTL);
    
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    // Check if post exists
    await this.findOne(id);
    
    // Generate slug if title is updated but slug is not provided
    if (updatePostDto.title && !updatePostDto.slug) {
      updatePostDto.slug = this.slugify(updatePostDto.title);
    }

    const post = await this.prisma.post.update({
      where: { id },
      data: updatePostDto,
    });

    // Invalidate all list caches and the specific item cache
    await Promise.all([
      this.redis.delByPattern(`${this.CACHE_PREFIX}:list*`),
      this.redis.del(this.redis.generateKey(`${this.CACHE_PREFIX}:item`, { id })),
    ]);

    return post;
  }

  async remove(id: string) {
    // Check if post exists
    await this.findOne(id);
    
    const post = await this.prisma.post.delete({ where: { id } });

    // Invalidate all list caches and the specific item cache
    await Promise.all([
      this.redis.delByPattern(`${this.CACHE_PREFIX}:list*`),
      this.redis.del(this.redis.generateKey(`${this.CACHE_PREFIX}:item`, { id })),
    ]);

    return post;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}