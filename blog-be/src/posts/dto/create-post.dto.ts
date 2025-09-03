import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: 'Post title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'URL-friendly slug' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ description: 'Main post content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Short summary of the post' })
  @IsString()
  @IsNotEmpty()
  excerpt: string;

  @ApiPropertyOptional({ description: 'URL to cover image' })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({ description: 'ID of the author' })
  @IsString()
  @IsOptional()
  authorId?: string;

  @ApiProperty({ description: 'List of tags', type: [String] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({ description: 'Publication status', enum: ['draft', 'published'] })
  @IsEnum(['draft', 'published'])
  @IsOptional()
  status?: 'draft' | 'published' = 'draft';

  @ApiPropertyOptional({ description: 'SEO title' })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'SEO description' })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'Open Graph image URL' })
  @IsString()
  @IsOptional()
  openGraphImage?: string;
}
