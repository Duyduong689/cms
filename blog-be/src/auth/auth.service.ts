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
import { TokenUtil, JwtPayload, SessionData } from '../common/utils/token.util';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { randomBytes, randomUUID } from 'crypto';

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
   * Create a new session
   */
  private async createSession(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    const sessionId = randomUUID();
    const sessionPrefix = this.configService.get<string>('auth.auth.sessionPrefix');
    const refreshExpires = this.configService.get<string>('auth.jwt.refreshExpires');
    const ttl = this.parseExpirationToSeconds(refreshExpires);

    const sessionData: SessionData = {
      userId,
      userAgent,
      ipAddress,
      createdAt: new Date(),
    };

    await this.redis.set(`${sessionPrefix}${sessionId}`, sessionData, ttl);
    return sessionId;
  }

  /**
   * Validate session exists
   */
  private async validateSession(sessionId: string): Promise<SessionData | null> {
    const sessionPrefix = this.configService.get<string>('auth.auth.sessionPrefix');
    const sessionData = await this.redis.get(`${sessionPrefix}${sessionId}`) as SessionData | null;
    return sessionData;
  }

  /**
   * Delete session
   */
  private async deleteSession(sessionId: string): Promise<void> {
    const sessionPrefix = this.configService.get<string>('auth.auth.sessionPrefix');
    await this.redis.del(`${sessionPrefix}${sessionId}`);
  }

  /**
   * Block access token by adding to denylist
   */
  private async blockAccessToken(accessToken: string): Promise<void> {
    try {
      const payload = this.tokenUtil.verifyAccessToken(accessToken);
      if (payload.jti) {
        const blockedPrefix = this.configService.get<string>('auth.auth.blockedPrefix');
        const remainingTtl = TokenUtil.calculateRemainingTtl(accessToken);
        if (remainingTtl > 0) {
          await this.redis.set(`${blockedPrefix}${payload.jti}`, 'revoked', remainingTtl);
        }
      }
    } catch (error) {
      // Token might be expired or invalid, ignore
    }
  }

  /**
   * Login user with rate limiting
   */
  async login(
    loginDto: LoginDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
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

    // Create session
    const sessionId = await this.createSession(user.id, userAgent, ipAddress);

    // Generate tokens with session ID
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      sid: sessionId,
    };

    const { accessToken, refreshToken, refreshJti, accessJti } = this.tokenUtil.generateTokenPair(tokenPayload);

    // Store refresh token mapping in Redis
    const refreshPrefix = this.configService.get<string>('auth.auth.refreshPrefix');
    const refreshExpires = this.configService.get<string>('auth.jwt.refreshExpires');
    const ttl = this.parseExpirationToSeconds(refreshExpires);
    
    await this.redis.set(`${refreshPrefix}${refreshJti}`, { userId: user.id, sessionId }, ttl);

    return { accessToken, refreshToken };
  }

  /**
   * Refresh access token
   */
  async refresh(userId: string, refreshJti: string, sessionId: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Validate session still exists
    const sessionData = await this.validateSession(sessionId);
    if (!sessionData || sessionData.userId !== userId) {
      throw new UnauthorizedException('Session no longer valid');
    }
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

    const tokenPayloadWithSession = {
      ...tokenPayload,
      sid: sessionId,
    };

    const { accessToken, refreshToken, refreshJti: newRefreshJti, accessJti } = this.tokenUtil.generateTokenPair(tokenPayloadWithSession);

    // Rotate refresh token (delete old, store new)
    const refreshPrefix = this.configService.get<string>('auth.auth.refreshPrefix');
    const refreshExpires = this.configService.get<string>('auth.jwt.refreshExpires');
    const ttl = this.parseExpirationToSeconds(refreshExpires);

    // Update session TTL and rotate refresh token
    const sessionPrefix = this.configService.get<string>('auth.auth.sessionPrefix');
    await Promise.all([
      this.redis.del(`${refreshPrefix}${refreshJti}`), // Delete old refresh token
      this.redis.set(`${refreshPrefix}${newRefreshJti}`, { userId: user.id, sessionId }, ttl), // Store new refresh token
      this.redis.expire(`${sessionPrefix}${sessionId}`, ttl), // Extend session TTL
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Logout user (revoke session and tokens)
   */
  async logout(
    sessionId: string,
    refreshJti?: string,
    accessToken?: string,
  ): Promise<{ success: boolean }> {
    const promises: Promise<any>[] = [];

    // Delete session (this invalidates all tokens with this sessionId)
    promises.push(this.deleteSession(sessionId));

    // Delete refresh token if provided
    if (refreshJti) {
      const refreshPrefix = this.configService.get<string>('auth.auth.refreshPrefix');
      promises.push(this.redis.del(`${refreshPrefix}${refreshJti}`));
    }

    // Block access token if provided
    if (accessToken) {
      promises.push(this.blockAccessToken(accessToken));
    }

    await Promise.allSettled(promises);
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
      return this.jwtService.decode(token) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Decode access token without validation
   */
  decodeAccessToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.decode(token) as JwtPayload;
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
