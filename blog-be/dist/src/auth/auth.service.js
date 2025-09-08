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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../common/prisma/prisma.service");
const redis_service_1 = require("../common/redis/redis.service");
const password_util_1 = require("../common/utils/password.util");
const token_util_1 = require("../common/utils/token.util");
const mail_service_1 = require("./mail/mail.service");
const crypto_1 = require("crypto");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, redis, jwtService, configService, mailService) {
        this.prisma = prisma;
        this.redis = redis;
        this.jwtService = jwtService;
        this.configService = configService;
        this.mailService = mailService;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.tokenUtil = new token_util_1.TokenUtil(jwtService, configService.get("auth.jwt.accessSecret"), configService.get("auth.jwt.refreshSecret"), configService.get("auth.jwt.accessExpires"), configService.get("auth.jwt.refreshExpires"));
    }
    async validateUser(email, password) {
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
        if (user.status !== "ACTIVE") {
            throw new common_1.UnauthorizedException("User account is disabled");
        }
        const isPasswordValid = await password_util_1.PasswordUtil.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return null;
        }
        const { passwordHash, ...result } = user;
        return result;
    }
    async register(registerDto) {
        const { name, email, password } = registerDto;
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedName = name.trim();
        const passwordValidation = password_util_1.PasswordUtil.validateStrength(password);
        if (!passwordValidation.isValid) {
            throw new common_1.BadRequestException(passwordValidation.errors.join(", "));
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (existingUser) {
            throw new common_1.ConflictException("User with this email already exists");
        }
        const saltRounds = this.configService.get("auth.auth.bcryptSaltRounds");
        const passwordHash = await password_util_1.PasswordUtil.hash(password, saltRounds);
        const user = await this.prisma.user.create({
            data: {
                name: normalizedName,
                email: normalizedEmail,
                passwordHash,
                role: "CUSTOMER",
                status: "ACTIVE",
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
    async createSession(userId, userAgent, ipAddress) {
        const sessionId = (0, crypto_1.randomUUID)();
        const sessionPrefix = this.configService.get("auth.auth.sessionPrefix");
        const refreshExpires = this.configService.get("auth.jwt.refreshExpires");
        const ttl = this.parseExpirationToSeconds(refreshExpires);
        const sessionData = {
            userId,
            userAgent,
            ipAddress,
            createdAt: new Date(),
        };
        await this.redis.set(`${sessionPrefix}${sessionId}`, sessionData, ttl);
        return sessionId;
    }
    async validateSession(sessionId) {
        const sessionPrefix = this.configService.get("auth.auth.sessionPrefix");
        const sessionData = (await this.redis.get(`${sessionPrefix}${sessionId}`));
        return sessionData;
    }
    async deleteSession(sessionId) {
        const sessionPrefix = this.configService.get("auth.auth.sessionPrefix");
        await this.redis.del(`${sessionPrefix}${sessionId}`);
    }
    async blockAccessToken(accessToken) {
        try {
            const payload = this.tokenUtil.verifyAccessToken(accessToken);
            if (payload.jti) {
                const blockedPrefix = this.configService.get("auth.auth.blockedPrefix");
                const remainingTtl = token_util_1.TokenUtil.calculateRemainingTtl(accessToken);
                if (remainingTtl > 0) {
                    await this.redis.set(`${blockedPrefix}${payload.jti}`, "revoked", remainingTtl);
                }
            }
        }
        catch (error) {
        }
    }
    async login(loginDto, userAgent, ipAddress) {
        const { email, password } = loginDto;
        const normalizedEmail = email.toLowerCase().trim();
        await this.checkRateLimit(normalizedEmail);
        const user = await this.validateUser(normalizedEmail, password);
        if (!user) {
            await this.recordFailedAttempt(normalizedEmail);
            throw new common_1.UnauthorizedException("Invalid credentials");
        }
        await this.clearFailedAttempts(normalizedEmail);
        const sessionId = await this.createSession(user.id, userAgent, ipAddress);
        const tokenPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            sid: sessionId,
        };
        const { accessToken, refreshToken, refreshJti, accessJti } = this.tokenUtil.generateTokenPair(tokenPayload);
        const refreshPrefix = this.configService.get("auth.auth.refreshPrefix");
        const refreshExpires = this.configService.get("auth.jwt.refreshExpires");
        const ttl = this.parseExpirationToSeconds(refreshExpires);
        await this.redis.set(`${refreshPrefix}${refreshJti}`, { userId: user.id, sessionId }, ttl);
        return { accessToken, refreshToken };
    }
    async refresh(userId, refreshJti, sessionId) {
        const sessionData = await this.validateSession(sessionId);
        if (!sessionData || sessionData.userId !== userId) {
            throw new common_1.UnauthorizedException("Session no longer valid");
        }
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
            throw new common_1.NotFoundException("User not found");
        }
        if (user.status !== "ACTIVE") {
            throw new common_1.UnauthorizedException("User account is disabled");
        }
        const tokenPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const tokenPayloadWithSession = {
            ...tokenPayload,
            sid: sessionId,
        };
        const { accessToken, refreshToken, refreshJti: newRefreshJti, accessJti, } = this.tokenUtil.generateTokenPair(tokenPayloadWithSession);
        const refreshPrefix = this.configService.get("auth.auth.refreshPrefix");
        const refreshExpires = this.configService.get("auth.jwt.refreshExpires");
        const ttl = this.parseExpirationToSeconds(refreshExpires);
        const sessionPrefix = this.configService.get("auth.auth.sessionPrefix");
        await Promise.all([
            this.redis.del(`${refreshPrefix}${refreshJti}`),
            this.redis.set(`${refreshPrefix}${newRefreshJti}`, { userId: user.id, sessionId }, ttl),
            this.redis.expire(`${sessionPrefix}${sessionId}`, ttl),
        ]);
        return { accessToken, refreshToken };
    }
    async logout(sessionId, refreshJti, accessToken) {
        const promises = [];
        promises.push(this.deleteSession(sessionId));
        if (refreshJti) {
            const refreshPrefix = this.configService.get("auth.auth.refreshPrefix");
            promises.push(this.redis.del(`${refreshPrefix}${refreshJti}`));
        }
        if (accessToken) {
            promises.push(this.blockAccessToken(accessToken));
        }
        await Promise.allSettled(promises);
        return { success: true };
    }
    async forgotPassword(forgotPasswordDto, userAgent, ipAddress) {
        const { email } = forgotPasswordDto;
        const normalizedEmail = email.toLowerCase().trim();
        await this.checkForgotPasswordRateLimit(normalizedEmail, ipAddress);
        await this.recordForgotPasswordAttempt(normalizedEmail, ipAddress);
        const user = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, name: true, status: true },
        });
        if (!user) {
            return { success: true };
        }
        if (user.status !== "ACTIVE") {
            return { success: true };
        }
        const resetToken = token_util_1.TokenUtil.generateResetToken();
        const resetPrefix = this.configService.get("auth.auth.resetPrefix");
        const ttl = this.configService.get("auth.auth.resetTokenTtl");
        await this.redis.set(`${resetPrefix}${resetToken}`, user.id, ttl);
        const appOrigin = this.configService.get("auth.app.origin");
        const resetUrl = token_util_1.TokenUtil.buildResetUrl(appOrigin, resetToken);
        try {
            await this.mailService.sendPasswordResetEmail(normalizedEmail, user.name, resetUrl);
        }
        catch (error) {
            console.error("Failed to send password reset email:", error);
        }
        return { success: true };
    }
    async resetPassword(resetPasswordDto) {
        const { token, password } = resetPasswordDto;
        const passwordValidation = password_util_1.PasswordUtil.validateStrength(password);
        if (!passwordValidation.isValid) {
            throw new common_1.BadRequestException(passwordValidation.errors.join(", "));
        }
        const resetPrefix = this.configService.get("auth.auth.resetPrefix");
        const userId = (await this.redis.get(`${resetPrefix}${token}`));
        if (!userId) {
            throw new common_1.BadRequestException("Invalid or expired reset token");
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, status: true },
        });
        if (!user || user.status !== "ACTIVE") {
            throw new common_1.BadRequestException("Invalid or expired reset token");
        }
        const saltRounds = this.configService.get("auth.auth.bcryptSaltRounds");
        const passwordHash = await password_util_1.PasswordUtil.hash(password, saltRounds);
        await Promise.all([
            this.prisma.user.update({
                where: { id: userId },
                data: { passwordHash },
            }),
            this.redis.del(`${resetPrefix}${token}`),
        ]);
        await this.revokeAllUserSessions(userId);
        return { success: true };
    }
    async getProfile(userId) {
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
            throw new common_1.NotFoundException("User not found");
        }
        return user;
    }
    decodeRefreshToken(token) {
        try {
            return this.jwtService.decode(token);
        }
        catch (error) {
            return null;
        }
    }
    decodeAccessToken(token) {
        try {
            return this.jwtService.decode(token);
        }
        catch (error) {
            return null;
        }
    }
    async checkRateLimit(email) {
        const maxAttempts = this.configService.get("auth.auth.loginMaxAttempts");
        const windowMin = this.configService.get("auth.auth.loginWindowMin");
        const rateLimitKey = `auth:login:${email}`;
        const attempts = (await this.redis.get(rateLimitKey));
        const attemptCount = attempts ? parseInt(attempts, 10) : 0;
        if (attemptCount >= maxAttempts) {
            throw new common_1.UnauthorizedException(`Too many login attempts. Please try again in ${windowMin} minutes.`);
        }
    }
    async recordFailedAttempt(email) {
        const windowMin = this.configService.get("auth.auth.loginWindowMin");
        const rateLimitKey = `auth:login:${email}`;
        const ttl = windowMin * 60;
        const attempts = (await this.redis.get(rateLimitKey));
        const attemptCount = attempts ? parseInt(attempts, 10) : 0;
        await this.redis.set(rateLimitKey, (attemptCount + 1).toString(), ttl);
    }
    async clearFailedAttempts(email) {
        const rateLimitKey = `auth:login:${email}`;
        await this.redis.del(rateLimitKey);
    }
    async checkForgotPasswordRateLimit(email, ipAddress) {
        const maxAttempts = this.configService.get("auth.auth.forgotPasswordMaxAttempts");
        const windowMin = this.configService.get("auth.auth.forgotPasswordWindowMin");
        const emailKey = `auth:forgot:${email}`;
        const emailAttempts = (await this.redis.get(emailKey));
        const emailAttemptCount = emailAttempts ? parseInt(emailAttempts, 10) : 0;
        let ipAttemptCount = 0;
        if (ipAddress) {
            const ipKey = `auth:forgot:ip:${ipAddress}`;
            const ipAttempts = (await this.redis.get(ipKey));
            ipAttemptCount = ipAttempts ? parseInt(ipAttempts, 10) : 0;
        }
        if (emailAttemptCount >= maxAttempts || ipAttemptCount >= maxAttempts) {
            this.logger.debug(`Too many password reset attempts. Please try again in ${windowMin} minutes.`);
            throw new common_1.UnauthorizedException(`Too many password reset attempts. Please try again in ${windowMin} minutes.`);
        }
    }
    async recordForgotPasswordAttempt(email, ipAddress) {
        const windowMin = this.configService.get("auth.auth.forgotPasswordWindowMin");
        const ttl = windowMin * 60;
        const promises = [];
        const emailKey = `auth:forgot:${email}`;
        const emailAttempts = (await this.redis.get(emailKey));
        const emailAttemptCount = emailAttempts ? parseInt(emailAttempts, 10) : 0;
        promises.push(this.redis.set(emailKey, (emailAttemptCount + 1).toString(), ttl));
        if (ipAddress) {
            const ipKey = `auth:forgot:ip:${ipAddress}`;
            const ipAttempts = (await this.redis.get(ipKey));
            const ipAttemptCount = ipAttempts ? parseInt(ipAttempts, 10) : 0;
            promises.push(this.redis.set(ipKey, (ipAttemptCount + 1).toString(), ttl));
        }
        await Promise.all(promises);
    }
    async revokeAllUserSessions(userId) {
        const sessionPrefix = this.configService.get("auth.auth.sessionPrefix");
        try {
            console.log(`Sessions for user ${userId} should be revoked`);
        }
        catch (error) {
            console.error("Failed to revoke user sessions:", error);
        }
    }
    parseExpirationToSeconds(expiration) {
        const match = expiration.match(/^(\d+)([smhd])$/);
        if (!match) {
            return 7 * 24 * 60 * 60;
        }
        const value = parseInt(match[1], 10);
        const unit = match[2];
        switch (unit) {
            case "s":
                return value;
            case "m":
                return value * 60;
            case "h":
                return value * 60 * 60;
            case "d":
                return value * 24 * 60 * 60;
            default:
                return 7 * 24 * 60 * 60;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map