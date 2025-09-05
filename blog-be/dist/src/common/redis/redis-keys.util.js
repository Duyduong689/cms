"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisKeys = void 0;
class RedisKeys {
    static session(sessionId) {
        return `${this.SESSION_PREFIX}${sessionId}`;
    }
    static refreshToken(jti) {
        return `${this.REFRESH_PREFIX}${jti}`;
    }
    static blockedToken(jti) {
        return `${this.BLOCK_PREFIX}${jti}`;
    }
    static resetToken(token) {
        return `${this.RESET_PREFIX}${token}`;
    }
    static loginAttempt(email) {
        return `${this.LOGIN_PREFIX}${email}`;
    }
    static userSessionPattern(userId) {
        return `${this.SESSION_PREFIX}*`;
    }
}
exports.RedisKeys = RedisKeys;
RedisKeys.SESSION_PREFIX = 'auth:sess:';
RedisKeys.REFRESH_PREFIX = 'auth:refresh:';
RedisKeys.BLOCK_PREFIX = 'auth:block:';
RedisKeys.RESET_PREFIX = 'auth:reset:';
RedisKeys.LOGIN_PREFIX = 'auth:login:';
//# sourceMappingURL=redis-keys.util.js.map