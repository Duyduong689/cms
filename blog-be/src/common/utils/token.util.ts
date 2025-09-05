import { JwtService } from '@nestjs/jwt';
import { randomUUID, randomBytes } from 'crypto';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: string;
  type: 'access' | 'refresh';
  sid: string; // sessionId
  jti?: string; // JWT ID
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

export class TokenUtil {
  constructor(
    private jwtService: JwtService,
    private accessSecret: string,
    private refreshSecret: string,
    private accessExpires: string,
    private refreshExpires: string
  ) {}

  /**
   * Generate access token
   */
  generateAccessToken(payload: Omit<JwtPayload, 'type' | 'jti'>): { token: string; jti: string } {
    const jti = randomUUID();
    const token = this.jwtService.sign(
      { ...payload, type: 'access', jti },
      { 
        secret: this.accessSecret,
        expiresIn: this.accessExpires
      }
    );
    return { token, jti };
  }

  /**
   * Generate refresh token with JTI
   */
  generateRefreshToken(payload: Omit<JwtPayload, 'type' | 'jti'>): { token: string; jti: string } {
    const jti = randomUUID();
    const token = this.jwtService.sign(
      { ...payload, type: 'refresh', jti },
      { 
        secret: this.refreshSecret,
        expiresIn: this.refreshExpires
      }
    );
    return { token, jti };
  }

  /**
   * Generate token pair with session
   */
  generateTokenPair(payload: Omit<JwtPayload, 'type' | 'jti'>): TokenPair & { refreshJti: string; accessJti: string } {
    const sessionId = payload.sid;
    const { token: accessToken, jti: accessJti } = this.generateAccessToken(payload);
    const { token: refreshToken, jti: refreshJti } = this.generateRefreshToken(payload);
    
    return {
      accessToken,
      refreshToken,
      sessionId,
      refreshJti, // refresh token JTI
      accessJti, // access token JTI
    };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): JwtPayload {
    const payload = this.jwtService.verify(token, { secret: this.accessSecret }) as JwtPayload;
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return payload;
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): JwtPayload {
    const payload = this.jwtService.verify(token, { secret: this.refreshSecret }) as JwtPayload;
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    if (!payload.jti) {
      throw new Error('Missing JTI in refresh token');
    }
    return payload;
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Calculate remaining TTL for a JWT token
   */
  static calculateRemainingTtl(token: string): number {
    try {
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const expirationTime = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const remainingMs = expirationTime - currentTime;
      return Math.max(0, Math.ceil(remainingMs / 1000)); // Return seconds
    } catch {
      return 0;
    }
  }

  /**
   * Generate a secure random token for password reset
   */
  static generateResetToken(): string {
    // Generate 32 random bytes and encode as base64url
    return randomBytes(32).toString('base64url');
  }

  /**
   * Build password reset URL
   */
  static buildResetUrl(appOrigin: string, token: string): string {
    return `${appOrigin}/reset-password/${token}`;
  }
}
