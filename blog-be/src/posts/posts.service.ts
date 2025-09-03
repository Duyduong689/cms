import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto) {
    // Create a copy of the DTO to avoid modifying the original
    const { title, slug, ...restData } = createPostDto;
    
    // Ensure slug is always defined (required by Prisma schema)
    const finalSlug = slug || this.slugify(title);

    return this.prisma.post.create({
      data: {
        title,
        slug: finalSlug,
        ...restData,
      },
    });
  }

  async findAll(query: QueryPostDto) {
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

    return {
      items,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    // Check if post exists
    await this.findOne(id);
    
    // Generate slug if title is updated but slug is not provided
    if (updatePostDto.title && !updatePostDto.slug) {
      updatePostDto.slug = this.slugify(updatePostDto.title);
    }

    return this.prisma.post.update({
      where: { id },
      data: updatePostDto,
    });
  }

  async remove(id: string) {
    // Check if post exists
    await this.findOne(id);
    
    return this.prisma.post.delete({ where: { id } });
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
