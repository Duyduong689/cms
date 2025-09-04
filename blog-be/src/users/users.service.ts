import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { CreateUserDto, Role, UserStatus } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { PageResponse, buildMeta, clampPage, clampLimit } from '../common/pagination/pagination';
import { generateQueryHash, keyOfList, keyOfUser, USERS_LIST_PREFIX, USERS_LIST_SET } from '../common/cache/cache-keys';
import { cacheConfig } from '../config/cache.config';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll(query: QueryUserDto): Promise<PageResponse<any>> {
    const { q, role, status, page = 1, limit = 10 } = query;
    const clampedPage = clampPage(page);
    const clampedLimit = clampLimit(limit);
    const skip = (clampedPage - 1) * clampedLimit;

    // Generate cache key
    const queryHash = generateQueryHash({ q, role, status, page: clampedPage, limit: clampedLimit });
    const cacheKey = keyOfList(queryHash);

    // Try to get from cache first
    const cached = await this.redis.get(cacheKey) as PageResponse<any> | null;
    if (cached) {
      return cached;
    }

    // Build filter conditions
    const where: any = {};
    
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    if (status) {
      where.status = status;
    }

    // Get total count for pagination
    const total = await this.prisma.user.count({ where });
    
    // Get users with pagination
    const items = await this.prisma.user.findMany({
      where,
      skip,
      take: clampedLimit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        // Exclude passwordHash for security
      },
    });

    const result = {
      items,
      meta: buildMeta(clampedPage, clampedLimit, total),
    };

    // Cache the result
    await this.redis.set(cacheKey, result, cacheConfig.ttl);
    
    // Track this cache key for invalidation
    await this.trackCacheKey(cacheKey);

    return result;
  }

  async findOne(id: string): Promise<any> {
    const cacheKey = keyOfUser(id);
    
    // Try to get from cache first
    const cached = await this.redis.get(cacheKey) as any | null;
    if (cached) {
      return cached;
    }

    const user = await this.prisma.user.findUnique({ 
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        // Exclude passwordHash for security
      },
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Cache the user
    await this.redis.set(cacheKey, user, cacheConfig.ttl);
    
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<any> {
    const { name, email, role = Role.CUSTOMER, status = UserStatus.ACTIVE, avatarUrl, tempPassword } = createUserDto;

    // Normalize data
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedName = name.trim();

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Generate password
    const password = tempPassword || this.generateSecurePassword();
    const passwordHash = await bcrypt.hash(password, cacheConfig.saltRounds);

    // Log generated password in development (remove in production)
    if (!tempPassword) {
      console.warn(`[DEV] Generated password for ${normalizedEmail}: ${password}`);
    }

    const user = await this.prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        role,
        status,
        avatarUrl,
        passwordHash,
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
        // Exclude passwordHash for security
      },
    });

    // Invalidate list cache
    await this.invalidateListCache();

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    // Check if user exists
    await this.findOne(id);

    const { name, email, role, status, avatarUrl, newPassword } = updateUserDto;
    
    // Normalize data
    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedName = name?.trim();

    // Check email uniqueness if email is being updated
    if (normalizedEmail) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (normalizedName !== undefined) updateData.name = normalizedName;
    if (normalizedEmail !== undefined) updateData.email = normalizedEmail;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    
    if (newPassword) {
      updateData.passwordHash = await bcrypt.hash(newPassword, cacheConfig.saltRounds);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        // Exclude passwordHash for security
      },
    });

    // Invalidate caches
    await this.invalidateUserCache(id);
    await this.invalidateListCache();

    return user;
  }

  async remove(id: string): Promise<any> {
    // Check if user exists
    const user = await this.findOne(id);

    // Guard against deleting last admin
    await this.guardLastAdmin(id, user.role);

    const deletedUser = await this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        // Exclude passwordHash for security
      },
    });

    // Invalidate caches
    await this.invalidateUserCache(id);
    await this.invalidateListCache();

    return deletedUser;
  }

  async toggleStatus(id: string): Promise<any> {
    const user = await this.findOne(id);
    
    // Guard against disabling last admin
    if (user.status === UserStatus.ACTIVE && user.role === Role.ADMIN) {
      await this.guardLastAdmin(id, user.role);
    }

    const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.DISABLED : UserStatus.ACTIVE;
    
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { status: newStatus },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        // Exclude passwordHash for security
      },
    });

    // Invalidate caches
    await this.invalidateUserCache(id);
    await this.invalidateListCache();

    return updatedUser;
  }

  async resetPassword(id: string): Promise<{ success: boolean }> {
    // Check if user exists
    await this.findOne(id);

    // Generate new secure password
    const newPassword = this.generateSecurePassword();
    const passwordHash = await bcrypt.hash(newPassword, cacheConfig.saltRounds);

    // Update password
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    // Log generated password in development (remove in production)
    console.warn(`[DEV] Reset password for user ${id}: ${newPassword}`);
    
    // TODO: Integrate with email service to send password via email/OTP
    // await this.emailService.sendPasswordReset(user.email, newPassword);

    return { success: true };
  }

  private async guardLastAdmin(userId: string, userRole: Role): Promise<void> {
    if (userRole !== Role.ADMIN) return;

    const adminCount = await this.prisma.user.count({
      where: { 
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    if (adminCount <= 1) {
      throw new BadRequestException('Cannot delete or disable the last active admin user');
    }
  }

  private generateSecurePassword(): string {
    // Generate 16-character password using crypto.randomBytes
    return randomBytes(12).toString('base64url').substring(0, 16);
  }

  private async trackCacheKey(cacheKey: string): Promise<void> {
    // Track cache keys for invalidation
    await this.redis.set(`${USERS_LIST_SET}:${cacheKey}`, '1', cacheConfig.ttl);
  }

  private async invalidateListCache(): Promise<void> {
    // Invalidate all list cache keys
    // Note: This is a simplified approach. In production, you might want to use Redis SCAN
    // or maintain a set of active cache keys for more efficient invalidation
    const pattern = `${USERS_LIST_PREFIX}:*`;
    
    // For now, we'll just clear the tracking set
    // In a real implementation, you'd iterate through tracked keys and delete them
    try {
      // This is a placeholder - actual implementation would depend on your Redis setup
      // await this.redis.delPattern(pattern);
    } catch (error) {
      console.warn('Failed to invalidate list cache:', error);
    }
  }

  private async invalidateUserCache(userId: string): Promise<void> {
    const cacheKey = keyOfUser(userId);
    await this.redis.del(cacheKey);
  }
}
