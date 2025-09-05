export declare class RedisKeys {
    private static readonly SESSION_PREFIX;
    private static readonly REFRESH_PREFIX;
    private static readonly BLOCK_PREFIX;
    private static readonly RESET_PREFIX;
    private static readonly LOGIN_PREFIX;
    static session(sessionId: string): string;
    static refreshToken(jti: string): string;
    static blockedToken(jti: string): string;
    static resetToken(token: string): string;
    static loginAttempt(email: string): string;
    static userSessionPattern(userId: string): string;
}
