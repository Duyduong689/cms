import { JwtService } from '@nestjs/jwt';
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    type: 'access' | 'refresh';
    jti?: string;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export declare class TokenUtil {
    private jwtService;
    constructor(jwtService: JwtService);
    generateAccessToken(payload: Omit<JwtPayload, 'type' | 'jti'>): string;
    generateRefreshToken(payload: Omit<JwtPayload, 'type' | 'jti'>): {
        token: string;
        jti: string;
    };
    generateTokenPair(payload: Omit<JwtPayload, 'type' | 'jti'>): TokenPair & {
        jti: string;
    };
    verifyAccessToken(token: string): JwtPayload;
    verifyRefreshToken(token: string): JwtPayload;
    static extractTokenFromHeader(authHeader: string | undefined): string | null;
}
