import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { 
  ApiCreatedResponse, 
  ApiOkResponse, 
  ApiOperation, 
  ApiTags, 
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse 
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { Post as PostEntity } from './entities/post.entity';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/utils/token.util';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiCreatedResponse({ type: PostEntity })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions to create posts' })
  create(@Body() createPostDto: CreatePostDto, @CurrentUser() user: JwtPayload) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all posts with pagination and filtering' })
  @ApiOkResponse({ description: 'Returns posts with pagination metadata' })
  findAll(@Query() query: QueryPostDto) {
    return this.postsService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiOkResponse({ type: PostEntity })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a post' })
  @ApiOkResponse({ type: PostEntity })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions to update posts' })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @CurrentUser() user: JwtPayload) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post' })
  @ApiOkResponse({ type: PostEntity })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions to delete posts' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.postsService.remove(id);
  }
}
