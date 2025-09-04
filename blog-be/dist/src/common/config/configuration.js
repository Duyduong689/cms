"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configuration = void 0;
const configuration = () => ({
    database: {
        url: process.env.DATABASE_URL,
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        ttl: parseInt(process.env.REDIS_TTL, 10) || 60 * 60,
        max: parseInt(process.env.REDIS_MAX_ITEMS, 10) || 100,
    },
    auth: {
        jwt: {
            accessSecret: process.env.JWT_ACCESS_SECRET,
            accessExpires: process.env.JWT_ACCESS_EXPIRES,
            refreshSecret: process.env.JWT_REFRESH_SECRET,
            refreshExpires: process.env.JWT_REFRESH_EXPIRES,
        },
        auth: {
            refreshPrefix: process.env.AUTH_REFRESH_PREFIX,
            resetPrefix: process.env.AUTH_RESET_PREFIX,
            bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
            loginMaxAttempts: parseInt(process.env.LOGIN_MAX_ATTEMPTS, 10) || 5,
            loginWindowMin: parseInt(process.env.LOGIN_WINDOW_MIN, 10) || 15,
        },
    }
});
exports.configuration = configuration;
//# sourceMappingURL=configuration.js.map