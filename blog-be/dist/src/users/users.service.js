"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const redis_service_1 = require("../common/redis/redis.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const pagination_1 = require("../common/pagination/pagination");
const cache_keys_1 = require("../common/cache/cache-keys");
const cache_config_1 = require("../config/cache.config");
const bcrypt = __importStar(require("bcryptjs"));
const crypto_1 = require("crypto");
let UsersService = class UsersService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async findAll(query) {
        const { q, role, status, page = 1, limit = 10 } = query;
        const clampedPage = (0, pagination_1.clampPage)(page);
        const clampedLimit = (0, pagination_1.clampLimit)(limit);
        const skip = (clampedPage - 1) * clampedLimit;
        const queryHash = (0, cache_keys_1.generateQueryHash)({ q, role, status, page: clampedPage, limit: clampedLimit });
        const cacheKey = (0, cache_keys_1.keyOfList)(queryHash);
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return cached;
        }
        const where = {};
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
        const total = await this.prisma.user.count({ where });
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
            },
        });
        const result = {
            items,
            meta: (0, pagination_1.buildMeta)(clampedPage, clampedLimit, total),
        };
        await this.redis.set(cacheKey, result, cache_config_1.cacheConfig.ttl);
        await this.trackCacheKey(cacheKey);
        return result;
    }
    async findOne(id) {
        const cacheKey = (0, cache_keys_1.keyOfUser)(id);
        const cached = await this.redis.get(cacheKey);
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
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        await this.redis.set(cacheKey, user, cache_config_1.cacheConfig.ttl);
        return user;
    }
    async create(createUserDto) {
        const { name, email, role = create_user_dto_1.Role.CUSTOMER, status = create_user_dto_1.UserStatus.ACTIVE, avatarUrl, tempPassword } = createUserDto;
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedName = name.trim();
        const existingUser = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const password = tempPassword || this.generateSecurePassword();
        const passwordHash = await bcrypt.hash(password, cache_config_1.cacheConfig.saltRounds);
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
            },
        });
        await this.invalidateListCache();
        return user;
    }
    async update(id, updateUserDto) {
        await this.findOne(id);
        const { name, email, role, status, avatarUrl, newPassword } = updateUserDto;
        const normalizedEmail = email?.toLowerCase().trim();
        const normalizedName = name?.trim();
        if (normalizedEmail) {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: normalizedEmail },
            });
            if (existingUser && existingUser.id !== id) {
                throw new common_1.ConflictException('User with this email already exists');
            }
        }
        const updateData = {};
        if (normalizedName !== undefined)
            updateData.name = normalizedName;
        if (normalizedEmail !== undefined)
            updateData.email = normalizedEmail;
        if (role !== undefined)
            updateData.role = role;
        if (status !== undefined)
            updateData.status = status;
        if (avatarUrl !== undefined)
            updateData.avatarUrl = avatarUrl;
        if (newPassword) {
            updateData.passwordHash = await bcrypt.hash(newPassword, cache_config_1.cacheConfig.saltRounds);
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
            },
        });
        await this.invalidateUserCache(id);
        await this.invalidateListCache();
        return user;
    }
    async remove(id) {
        const user = await this.findOne(id);
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
            },
        });
        await this.invalidateUserCache(id);
        await this.invalidateListCache();
        return deletedUser;
    }
    async toggleStatus(id) {
        const user = await this.findOne(id);
        if (user.status === create_user_dto_1.UserStatus.ACTIVE && user.role === create_user_dto_1.Role.ADMIN) {
            await this.guardLastAdmin(id, user.role);
        }
        const newStatus = user.status === create_user_dto_1.UserStatus.ACTIVE ? create_user_dto_1.UserStatus.DISABLED : create_user_dto_1.UserStatus.ACTIVE;
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
            },
        });
        await this.invalidateUserCache(id);
        await this.invalidateListCache();
        return updatedUser;
    }
    async resetPassword(id) {
        await this.findOne(id);
        const newPassword = this.generateSecurePassword();
        const passwordHash = await bcrypt.hash(newPassword, cache_config_1.cacheConfig.saltRounds);
        await this.prisma.user.update({
            where: { id },
            data: { passwordHash },
        });
        console.warn(`[DEV] Reset password for user ${id}: ${newPassword}`);
        return { success: true };
    }
    async guardLastAdmin(userId, userRole) {
        if (userRole !== create_user_dto_1.Role.ADMIN)
            return;
        const adminCount = await this.prisma.user.count({
            where: {
                role: create_user_dto_1.Role.ADMIN,
                status: create_user_dto_1.UserStatus.ACTIVE,
            },
        });
        if (adminCount <= 1) {
            throw new common_1.BadRequestException('Cannot delete or disable the last active admin user');
        }
    }
    generateSecurePassword() {
        return (0, crypto_1.randomBytes)(12).toString('base64url').substring(0, 16);
    }
    async trackCacheKey(cacheKey) {
        await this.redis.set(`${cache_keys_1.USERS_LIST_SET}:${cacheKey}`, '1', cache_config_1.cacheConfig.ttl);
    }
    async invalidateListCache() {
        const pattern = `${cache_keys_1.USERS_LIST_PREFIX}:*`;
        try {
        }
        catch (error) {
            console.warn('Failed to invalidate list cache:', error);
        }
    }
    async invalidateUserCache(userId) {
        const cacheKey = (0, cache_keys_1.keyOfUser)(userId);
        await this.redis.del(cacheKey);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], UsersService);
//# sourceMappingURL=users.service.js.map