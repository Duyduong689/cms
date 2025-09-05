import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  jwt: {
    accessSecret: string;
    accessExpires: string;
    refreshSecret: string;
    refreshExpires: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  auth: {
    sessionPrefix: string;
    refreshPrefix: string;
    resetPrefix: string;
    blockedPrefix: string;
    bcryptSaltRounds: number;
    loginMaxAttempts: number;
    loginWindowMin: number;
  };
}

export default registerAs('auth', (): AuthConfig => ({
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
  },
}));
