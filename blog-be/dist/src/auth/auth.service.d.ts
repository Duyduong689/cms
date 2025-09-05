import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../common/prisma/prisma.service";
import { RedisService } from "../common/redis/redis.service";
import { JwtPayload } from "../common/utils/token.util";
import { MailService } from "./mail/mail.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
export declare class AuthService {
    private prisma;
    private redis;
    private jwtService;
    private configService;
    private mailService;
    private tokenUtil;
    constructor(prisma: PrismaService, redis: RedisService, jwtService: JwtService, configService: ConfigService, mailService: MailService);
    validateUser(email: string, password: string): Promise<any>;
    register(registerDto: RegisterDto): Promise<any>;
    private createSession;
    private validateSession;
    private deleteSession;
    private blockAccessToken;
    login(loginDto: LoginDto, userAgent?: string, ipAddress?: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(userId: string, refreshJti: string, sessionId: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(sessionId: string, refreshJti?: string, accessToken?: string): Promise<{
        success: boolean;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto, userAgent?: string, ipAddress?: string): Promise<{
        success: boolean;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        success: boolean;
    }>;
    getProfile(userId: string): Promise<any>;
    decodeRefreshToken(token: string): JwtPayload | null;
    decodeAccessToken(token: string): JwtPayload | null;
    private checkRateLimit;
    private recordFailedAttempt;
    private clearFailedAttempts;
    private checkForgotPasswordRateLimit;
    private recordForgotPasswordAttempt;
    private revokeAllUserSessions;
    private parseExpirationToSeconds;
}
