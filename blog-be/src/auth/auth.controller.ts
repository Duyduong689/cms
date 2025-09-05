import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/utils/token.util';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account with email and password',
  })
  @ApiCreatedResponse({
    description: 'User registered successfully',
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
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or password does not meet requirements',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Password must contain at least one lowercase letter' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiConflictResponse({
    description: 'User with this email already exists',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'User with this email already exists' },
        error: { type: 'string', example: 'Conflict' },
      },
    },
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticate user with email and password, returns access and refresh tokens',
  })
  @ApiOkResponse({
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Password must be at least 8 characters long' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials or too many login attempts',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Invalid credentials' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress;
    const { accessToken, refreshToken } = await this.authService.login(loginDto, userAgent, ipAddress);
    
    // Set httpOnly cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    return { success: true };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('refresh-token')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generate new access and refresh tokens using valid refresh token',
  })
  @ApiOkResponse({
    description: 'Tokens refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Invalid or expired refresh token' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async refresh(@CurrentUser() user: JwtPayload, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.refresh(user.sub, user.jti!, user.sid);
    
    // Set new httpOnly cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    return { success: true };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout user',
    description: 'Clear authentication cookies and optionally revoke refresh token',
  })
  @ApiOkResponse({
    description: 'Logout successful',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Try to extract both tokens from cookies
    const refreshToken = req.cookies?.refreshToken;
    const accessToken = req.cookies?.accessToken;
    
    let sessionId: string | undefined;
    let refreshJti: string | undefined;
    
    // Extract session ID and refresh JTI from tokens
    if (refreshToken) {
      try {
        const payload = this.authService.decodeRefreshToken(refreshToken);
        if (payload?.sid) {
          sessionId = payload.sid;
        }
        if (payload?.jti) {
          refreshJti = payload.jti;
        }
      } catch (error) {
        console.log('Failed to decode refresh token:', error.message);
      }
    }
    
    // If no session ID from refresh token, try access token
    if (!sessionId && accessToken) {
      try {
        const payload = this.authService.decodeAccessToken(accessToken);
        if (payload?.sid) {
          sessionId = payload.sid;
        }
      } catch (error) {
        console.log('Failed to decode access token:', error.message);
      }
    }
    
    // Logout with session-based approach
    if (sessionId) {
      await this.authService.logout(sessionId, refreshJti, accessToken);
    }
    
    // Always clear httpOnly cookies regardless of token validity
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    return { success: true };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Send password reset token to user email',
  })
  @ApiOkResponse({
    description: 'Password reset email sent (if user exists)',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid email format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Please provide a valid email address' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Req() req: Request,
  ) {
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress;
    return this.authService.forgotPassword(forgotPasswordDto, userAgent, ipAddress);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset user password using reset token',
  })
  @ApiOkResponse({
    description: 'Password reset successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid token or password does not meet requirements',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Invalid or expired reset token' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('me')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Get authenticated user profile information',
  })
  @ApiOkResponse({
    description: 'User profile retrieved successfully',
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
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired access token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.sub);
  }
}
