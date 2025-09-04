import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Role, UserStatus } from './create-user.dto';

export class QueryUserDto {
  @ApiPropertyOptional({ 
    description: 'Search term for name or email',
    example: 'john'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  q?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by role',
    enum: Role,
    example: Role.ADMIN
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ 
    description: 'Filter by status',
    enum: UserStatus,
    example: UserStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ 
    description: 'Page number',
    default: 1,
    minimum: 1,
    example: 1
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Items per page',
    default: 10,
    minimum: 1,
    maximum: 100,
    example: 10
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;
}
