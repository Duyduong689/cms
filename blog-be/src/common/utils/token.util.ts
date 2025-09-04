import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: string;
  type: 'access' | 'refresh';
  jti?: string; // JWT ID for refresh tokens
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class TokenUtil {
  constructor(private jwtService: JwtService) {}

  /**
   * Generate access token
   */
  generateAccessToken(payload: Omit<JwtPayload, 'type' | 'jti'>): string {
    return this.jwtService.sign(
      { ...payload, type: 'access' },
      { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
    );
  }

  /**
   * Generate refresh token with JTI
   */
  generateRefreshToken(payload: Omit<JwtPayload, 'type' | 'jti'>): { token: string; jti: string } {
    const jti = randomUUID();
    const token = this.jwtService.sign(
      { ...payload, type: 'refresh', jti },
      { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
    );
    return { token, jti };
  }

  /**
   * Generate token pair
   */
  generateTokenPair(payload: Omit<JwtPayload, 'type' | 'jti'>): TokenPair & { jti: string } {
    const accessToken = this.generateAccessToken(payload);
    const { token: refreshToken, jti } = this.generateRefreshToken(payload);
    
    return {
      accessToken,
      refreshToken,
      jti,
    };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): JwtPayload {
    const payload = this.jwtService.verify(token) as JwtPayload;
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return payload;
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): JwtPayload {
    const payload = this.jwtService.verify(token) as JwtPayload;
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
}
