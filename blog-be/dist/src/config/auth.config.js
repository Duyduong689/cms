"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('auth', () => ({
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key-change-in-production',
        accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
        refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
    },
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
    },
    auth: {
        sessionPrefix: process.env.AUTH_SESSION_PREFIX || 'auth:sess:',
        refreshPrefix: process.env.AUTH_REFRESH_PREFIX || 'auth:refresh:',
        resetPrefix: process.env.AUTH_RESET_PREFIX || 'auth:reset:',
        blockedPrefix: process.env.AUTH_BLOCKED_PREFIX || 'auth:block:',
        bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
        loginMaxAttempts: parseInt(process.env.LOGIN_MAX_ATTEMPTS || '5', 10),
        loginWindowMin: parseInt(process.env.LOGIN_WINDOW_MIN || '15', 10),
        resetTokenTtl: parseInt(process.env.RESET_TOKEN_TTL || '1800', 10),
        forgotPasswordMaxAttempts: parseInt(process.env.FORGOT_PASSWORD_MAX_ATTEMPTS || '5', 10),
        forgotPasswordWindowMin: parseInt(process.env.FORGOT_PASSWORD_WINDOW_MIN || '15', 10),
    },
    mail: {
        brevoApiKey: process.env.BREVO_API_KEY || '',
        brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || '',
        brevoSenderName: process.env.BREVO_SENDER_NAME || 'Blog CMS',
    },
    app: {
        origin: process.env.APP_ORIGIN || 'http://localhost:3000',
    },
}));
//# sourceMappingURL=auth.config.js.map