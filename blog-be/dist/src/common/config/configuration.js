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
});
exports.configuration = configuration;
//# sourceMappingURL=configuration.js.map