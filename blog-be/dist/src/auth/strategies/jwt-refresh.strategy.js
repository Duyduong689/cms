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
exports.JwtRefreshStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
let JwtRefreshStrategy = class JwtRefreshStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt-refresh') {
    constructor(configService, prisma, redis) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromExtractors([
                (request) => {
                    return request?.cookies?.refreshToken;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get('auth.jwt.refreshSecret'),
        });
        this.configService = configService;
        this.prisma = prisma;
        this.redis = redis;
    }
    async validate(payload) {
        if (payload.type !== 'refresh') {
            throw new common_1.UnauthorizedException('Invalid token type');
        }
        if (!payload.jti) {
            throw new common_1.UnauthorizedException('Missing JTI in refresh token');
        }
        if (!payload.sid) {
            throw new common_1.UnauthorizedException('Missing session ID in refresh token');
        }
        const refreshPrefix = this.configService.get('auth.auth.refreshPrefix');
        const refreshKey = `${refreshPrefix}${payload.jti}`;
        const refreshData = await this.redis.get(refreshKey);
        if (!refreshData || refreshData.userId !== payload.sub || refreshData.sessionId !== payload.sid) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const sessionPrefix = this.configService.get('auth.auth.sessionPrefix');
        const sessionExists = await this.redis.exists(`${sessionPrefix}${payload.sid}`);
        if (!sessionExists) {
            throw new common_1.UnauthorizedException('Session no longer valid');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        if (user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('User account is disabled');
        }
        return {
            sub: user.id,
            email: user.email,
            role: user.role,
            type: 'refresh',
            sid: payload.sid,
            jti: payload.jti,
        };
    }
};
exports.JwtRefreshStrategy = JwtRefreshStrategy;
exports.JwtRefreshStrategy = JwtRefreshStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], JwtRefreshStrategy);
//# sourceMappingURL=jwt-refresh.strategy.js.map