"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheConfig = void 0;
exports.cacheConfig = {
    ttl: parseInt(process.env.REDIS_TTL || '60', 10),
    maxItems: parseInt(process.env.REDIS_MAX_ITEMS || '500', 10),
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
};
//# sourceMappingURL=cache.config.js.map