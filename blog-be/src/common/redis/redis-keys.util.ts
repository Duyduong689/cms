/**
 * Redis key management utility for authentication system
 */
export class RedisKeys {
  private static readonly SESSION_PREFIX = 'auth:sess:';
  private static readonly REFRESH_PREFIX = 'auth:refresh:';
  private static readonly BLOCK_PREFIX = 'auth:block:';
  private static readonly RESET_PREFIX = 'auth:reset:';
  private static readonly LOGIN_PREFIX = 'auth:login:';

  /**
   * Generate session key
   */
  static session(sessionId: string): string {
    return `${this.SESSION_PREFIX}${sessionId}`;
  }

  /**
   * Generate refresh token key
   */
  static refreshToken(jti: string): string {
    return `${this.REFRESH_PREFIX}${jti}`;
  }

  /**
   * Generate blocked token key
   */
  static blockedToken(jti: string): string {
    return `${this.BLOCK_PREFIX}${jti}`;
  }

  /**
   * Generate reset token key
   */
  static resetToken(token: string): string {
    return `${this.RESET_PREFIX}${token}`;
  }

  /**
   * Generate login rate limit key
   */
  static loginAttempt(email: string): string {
    return `${this.LOGIN_PREFIX}${email}`;
  }

  /**
   * Get all session keys for a user (for logout-all functionality)
   */
  static userSessionPattern(userId: string): string {
    return `${this.SESSION_PREFIX}*`;
  }
}
