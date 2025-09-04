import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { PasswordUtil } from '../common/utils/password.util';
import { TokenUtil, JwtPayload } from '../common/utils/token.util';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private tokenUtil: TokenUtil;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.tokenUtil = new TokenUtil(jwtService);
  }

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return null;
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is disabled');
    }

    const isPasswordValid = await PasswordUtil.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    // Remove password hash from response
    const { passwordHash, ...result } = user;
    return result;
  }

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<any> {
    const { name, email, password } = registerDto;

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedName = name.trim();

    // Validate password strength
    const passwordValidation = PasswordUtil.validateStrength(password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException(passwordValidation.errors.join(', '));
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = this.configService.get<number>('auth.auth.bcryptSaltRounds');
    const passwordHash = await PasswordUtil.hash(password, saltRounds);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        passwordHash,
        role: 'CUSTOMER', // Default role
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Login user with rate limiting
   */
  async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = loginDto;
    const normalizedEmail = email.toLowerCase().trim();

    // Rate limiting check
    await this.checkRateLimit(normalizedEmail);

    // Validate user
    const user = await this.validateUser(normalizedEmail, password);
    if (!user) {
      await this.recordFailedAttempt(normalizedEmail);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Clear failed attempts on successful login
    await this.clearFailedAttempts(normalizedEmail);

    // Generate tokens
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken, jti } = this.tokenUtil.generateTokenPair(tokenPayload);

    // Store refresh token in Redis
    const refreshPrefix = this.configService.get<string>('auth.auth.refreshPrefix');
    const refreshExpires = this.configService.get<string>('auth.jwt.refreshExpires');
    const ttl = this.parseExpirationToSeconds(refreshExpires);
    
    await this.redis.set(`${refreshPrefix}${jti}`, user.id, ttl);

    return { accessToken, refreshToken };
  }

  /**
   * Refresh access token
   */
  async refresh(userId: string, refreshJti: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Get user details
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is disabled');
    }

    // Generate new token pair
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken, jti } = this.tokenUtil.generateTokenPair(tokenPayload);

    // Rotate refresh token (delete old, store new)
    const refreshPrefix = this.configService.get<string>('auth.auth.refreshPrefix');
    const refreshExpires = this.configService.get<string>('auth.jwt.refreshExpires');
    const ttl = this.parseExpirationToSeconds(refreshExpires);

    await Promise.all([
      this.redis.del(`${refreshPrefix}${refreshJti}`), // Delete old token
      this.redis.set(`${refreshPrefix}${jti}`, user.id, ttl), // Store new token
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Logout user (revoke refresh token)
   */
  async logout(refreshJti: string): Promise<{ success: boolean }> {
    const refreshPrefix = this.configService.get<string>('auth.auth.refreshPrefix');
    await this.redis.del(`${refreshPrefix}${refreshJti}`);
    
    return { success: true };
  }

  /**
   * Forgot password - generate reset token
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ success: boolean }> {
    const { email } = forgotPasswordDto;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, status: true },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return { success: true };
    }

    if (user.status !== 'ACTIVE') {
      // Don't reveal if user exists or not for security
      return { success: true };
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetPrefix = this.configService.get<string>('auth.auth.resetPrefix');
    const ttl = 30 * 60; // 30 minutes

    // Store reset token in Redis
    await this.redis.set(`${resetPrefix}${resetToken}`, user.id, ttl);

    // TODO: Send email with reset link
    // await this.emailService.sendPasswordResetEmail(normalizedEmail, resetToken);

    return { success: true };
  }

  /**
   * Reset password using token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ success: boolean }> {
    const { token, password } = resetPasswordDto;

    // Validate password strength
    const passwordValidation = PasswordUtil.validateStrength(password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException(passwordValidation.errors.join(', '));
    }

    // Get user ID from token
    const resetPrefix = this.configService.get<string>('auth.auth.resetPrefix');
    const userId = await this.redis.get(`${resetPrefix}${token}`) as string | null;

    if (!userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if user exists and is active
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const saltRounds = this.configService.get<number>('auth.auth.bcryptSaltRounds');
    const passwordHash = await PasswordUtil.hash(password, saltRounds);

    // Update password and delete reset token
    await Promise.all([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      this.redis.del(`${resetPrefix}${token}`),
    ]);

    return { success: true };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Decode refresh token without validation
   */
  decodeRefreshToken(token: string): JwtPayload | null {
    try {
      return this.tokenUtil.verifyRefreshToken(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Check rate limit for login attempts
   */
  private async checkRateLimit(email: string): Promise<void> {
    const maxAttempts = this.configService.get<number>('auth.auth.loginMaxAttempts');
    const windowMin = this.configService.get<number>('auth.auth.loginWindowMin');
    const rateLimitKey = `auth:login:${email}`;
    
    const attempts = await this.redis.get(rateLimitKey) as string | null;
    const attemptCount = attempts ? parseInt(attempts, 10) : 0;

    if (attemptCount >= maxAttempts) {
      throw new UnauthorizedException(
        `Too many login attempts. Please try again in ${windowMin} minutes.`
      );
    }
  }

  /**
   * Record failed login attempt
   */
  private async recordFailedAttempt(email: string): Promise<void> {
    const windowMin = this.configService.get<number>('auth.auth.loginWindowMin');
    const rateLimitKey = `auth:login:${email}`;
    const ttl = windowMin * 60; // Convert to seconds

    const attempts = await this.redis.get(rateLimitKey) as string | null;
    const attemptCount = attempts ? parseInt(attempts, 10) : 0;

    await this.redis.set(rateLimitKey, (attemptCount + 1).toString(), ttl);
  }

  /**
   * Clear failed login attempts
   */
  private async clearFailedAttempts(email: string): Promise<void> {
    const rateLimitKey = `auth:login:${email}`;
    await this.redis.del(rateLimitKey);
  }

  /**
   * Parse JWT expiration string to seconds
   */
  private parseExpirationToSeconds(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 7 * 24 * 60 * 60; // Default to 7 days
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 7 * 24 * 60 * 60;
    }
  }
}
