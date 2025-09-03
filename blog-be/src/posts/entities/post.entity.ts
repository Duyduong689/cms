import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Post {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Post title' })
  title: string;

  @ApiProperty({ description: 'URL-friendly slug' })
  slug: string;

  @ApiProperty({ description: 'Main post content' })
  content: string;

  @ApiProperty({ description: 'Short summary of the post' })
  excerpt: string;

  @ApiPropertyOptional({ description: 'URL to cover image' })
  coverImage?: string;

  @ApiPropertyOptional({ description: 'ID of the author' })
  authorId?: string;

  @ApiProperty({ description: 'List of tags', type: [String] })
  tags: string[];

  @ApiProperty({ description: 'Publication status', enum: ['draft', 'published'] })
  status: 'draft' | 'published';

  @ApiPropertyOptional({ description: 'SEO title' })
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'SEO description' })
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'Open Graph image URL' })
  openGraphImage?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: string;
}
