"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const redis_service_1 = require("../common/redis/redis.service");
const config_1 = require("@nestjs/config");
let PostsService = class PostsService {
    constructor(prisma, redis, configService) {
        this.prisma = prisma;
        this.redis = redis;
        this.configService = configService;
        this.CACHE_TTL = 60 * 5;
        this.CACHE_PREFIX = 'posts';
    }
    async create(createPostDto) {
        const { title, slug, ...restData } = createPostDto;
        const finalSlug = slug || this.slugify(title);
        const post = await this.prisma.post.create({
            data: {
                title,
                slug: finalSlug,
                ...restData,
            },
        });
        await this.redis.delByPattern(`${this.CACHE_PREFIX}:list*`);
        return post;
    }
    async findAll(query) {
        const cacheKey = this.redis.generateKey(`${this.CACHE_PREFIX}:list`, query);
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return cached;
        }
        const { q, status, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { slug: { contains: q, mode: 'insensitive' } },
            ];
        }
        if (status) {
            where.status = status;
        }
        const total = await this.prisma.post.count({ where });
        const items = await this.prisma.post.findMany({
            where,
            skip,
            take: limit,
            orderBy: { updatedAt: 'desc' },
        });
        const result = {
            items,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
        await this.redis.set(cacheKey, result, this.CACHE_TTL);
        return result;
    }
    async findOne(id) {
        const cacheKey = this.redis.generateKey(`${this.CACHE_PREFIX}:item`, { id });
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return cached;
        }
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (!post) {
            throw new common_1.NotFoundException(`Post with ID ${id} not found`);
        }
        await this.redis.set(cacheKey, post, this.CACHE_TTL);
        return post;
    }
    async update(id, updatePostDto) {
        await this.findOne(id);
        if (updatePostDto.title && !updatePostDto.slug) {
            updatePostDto.slug = this.slugify(updatePostDto.title);
        }
        const post = await this.prisma.post.update({
            where: { id },
            data: updatePostDto,
        });
        await Promise.all([
            this.redis.delByPattern(`${this.CACHE_PREFIX}:list*`),
            this.redis.del(this.redis.generateKey(`${this.CACHE_PREFIX}:item`, { id })),
        ]);
        return post;
    }
    async remove(id) {
        await this.findOne(id);
        const post = await this.prisma.post.delete({ where: { id } });
        await Promise.all([
            this.redis.delByPattern(`${this.CACHE_PREFIX}:list*`),
            this.redis.del(this.redis.generateKey(`${this.CACHE_PREFIX}:item`, { id })),
        ]);
        return post;
    }
    slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[\s_]+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/--+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        config_1.ConfigService])
], PostsService);
//# sourceMappingURL=posts.service.js.map