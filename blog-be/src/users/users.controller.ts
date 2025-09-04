import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Patch, 
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiCreatedResponse, 
  ApiOkResponse, 
  ApiOperation, 
  ApiTags, 
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, Role, UserStatus } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { PageResponse } from '../common/pagination/pagination';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all users with pagination and filtering',
    description: 'Retrieve a paginated list of users with optional filtering by role, status, and search query'
  })
  @ApiOkResponse({ 
    description: 'Returns users with pagination metadata',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
              name: { type: 'string', example: 'John Doe' },
              email: { type: 'string', example: 'john.doe@example.com' },
              role: { type: 'string', enum: ['ADMIN', 'STAFF', 'CUSTOMER'], example: 'CUSTOMER' },
              status: { type: 'string', enum: ['ACTIVE', 'DISABLED'], example: 'ACTIVE' },
              avatarUrl: { type: 'string', example: 'https://example.com/avatar.jpg' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            pages: { type: 'number', example: 5 },
            total: { type: 'number', example: 47 },
            limit: { type: 'number', example: 10 }
          }
        }
      }
    }
  })
  @ApiQuery({ name: 'q', required: false, description: 'Search term for name or email' })
  @ApiQuery({ name: 'role', required: false, enum: Role, description: 'Filter by role' })
  @ApiQuery({ name: 'status', required: false, enum: UserStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  findAll(@Query() query: QueryUserDto): Promise<PageResponse<any>> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a user by ID',
    description: 'Retrieve a specific user by their unique identifier'
  })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiOkResponse({ 
    description: 'User details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        role: { type: 'string', enum: ['ADMIN', 'STAFF', 'CUSTOMER'], example: 'CUSTOMER' },
        status: { type: 'string', enum: ['ACTIVE', 'DISABLED'], example: 'ACTIVE' },
        avatarUrl: { type: 'string', example: 'https://example.com/avatar.jpg' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create a new user',
    description: 'Create a new user account with the provided information'
  })
  @ApiCreatedResponse({ 
    description: 'User created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        role: { type: 'string', enum: ['ADMIN', 'STAFF', 'CUSTOMER'], example: 'CUSTOMER' },
        status: { type: 'string', enum: ['ACTIVE', 'DISABLED'], example: 'ACTIVE' },
        avatarUrl: { type: 'string', example: 'https://example.com/avatar.jpg' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'User with this email already exists' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update a user',
    description: 'Update user information. All fields are optional.'
  })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiOkResponse({ 
    description: 'User updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        role: { type: 'string', enum: ['ADMIN', 'STAFF', 'CUSTOMER'], example: 'CUSTOMER' },
        status: { type: 'string', enum: ['ACTIVE', 'DISABLED'], example: 'ACTIVE' },
        avatarUrl: { type: 'string', example: 'https://example.com/avatar.jpg' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiConflictResponse({ description: 'User with this email already exists' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete a user',
    description: 'Permanently delete a user account. Cannot delete the last admin user.'
  })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiOkResponse({ 
    description: 'User deleted successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        role: { type: 'string', enum: ['ADMIN', 'STAFF', 'CUSTOMER'], example: 'CUSTOMER' },
        status: { type: 'string', enum: ['ACTIVE', 'DISABLED'], example: 'ACTIVE' },
        avatarUrl: { type: 'string', example: 'https://example.com/avatar.jpg' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: 'Cannot delete the last admin user' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ 
    summary: 'Toggle user status',
    description: 'Toggle user status between ACTIVE and DISABLED. Cannot disable the last admin user.'
  })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiOkResponse({ 
    description: 'User status toggled successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        role: { type: 'string', enum: ['ADMIN', 'STAFF', 'CUSTOMER'], example: 'CUSTOMER' },
        status: { type: 'string', enum: ['ACTIVE', 'DISABLED'], example: 'DISABLED' },
        avatarUrl: { type: 'string', example: 'https://example.com/avatar.jpg' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: 'Cannot disable the last admin user' })
  toggleStatus(@Param('id') id: string) {
    return this.usersService.toggleStatus(id);
  }

  @Post(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Reset user password',
    description: 'Generate a new secure password for the user. The new password will be logged in development mode.'
  })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiOkResponse({ 
    description: 'Password reset successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  resetPassword(@Param('id') id: string) {
    return this.usersService.resetPassword(id);
  }
}
