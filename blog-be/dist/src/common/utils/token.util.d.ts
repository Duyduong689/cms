import { JwtService } from '@nestjs/jwt';
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    type: 'access' | 'refresh';
    sid: string;
    jti?: string;
}
export interface SessionData {
    userId: string;
    userAgent?: string;
    ipAddress?: string;
    createdAt: Date;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    sessionId: string;
}
export declare class TokenUtil {
    private jwtService;
    private accessSecret;
    private refreshSecret;
    private accessExpires;
    private refreshExpires;
    constructor(jwtService: JwtService, accessSecret: string, refreshSecret: string, accessExpires: string, refreshExpires: string);
    generateAccessToken(payload: Omit<JwtPayload, 'type' | 'jti'>): {
        token: string;
        jti: string;
    };
    generateRefreshToken(payload: Omit<JwtPayload, 'type' | 'jti'>): {
        token: string;
        jti: string;
    };
    generateTokenPair(payload: Omit<JwtPayload, 'type' | 'jti'>): TokenPair & {
        refreshJti: string;
        accessJti: string;
    };
    verifyAccessToken(token: string): JwtPayload;
    verifyRefreshToken(token: string): JwtPayload;
    static extractTokenFromHeader(authHeader: string | undefined): string | null;
    static calculateRemainingTtl(token: string): number;
    static generateResetToken(): string;
    static buildResetUrl(appOrigin: string, token: string): string;
}
