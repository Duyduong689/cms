"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = RedisService_1 = class RedisService {
    constructor(redis) {
        this.redis = redis;
        this.logger = new common_1.Logger(RedisService_1.name);
        this.testConnection();
    }
    async testConnection() {
        try {
            await this.redis.set('test:connection', 'ok', 'EX', 1);
            const result = await this.redis.get('test:connection');
            if (result === 'ok') {
                this.logger.log('Redis connection established successfully');
                await this.redis.del('test:connection');
            }
            else {
                this.logger.error('Redis connection test failed - value not retrieved');
            }
        }
        catch (error) {
            this.logger.error('Redis connection failed:', error.message);
        }
    }
    async get(key) {
        try {
            const value = await this.redis.get(key);
            if (value === null) {
                return undefined;
            }
            return JSON.parse(value);
        }
        catch (error) {
            this.logger.error(`Failed to get key ${key}:`, error.message);
            return undefined;
        }
    }
    async set(key, value, ttl) {
        try {
            const serializedValue = JSON.stringify(value);
            if (ttl) {
                await this.redis.set(key, serializedValue, 'EX', ttl);
            }
            else {
                await this.redis.set(key, serializedValue);
            }
            this.logger.debug(`Set key ${key} with TTL ${ttl || 'no expiration'}`);
        }
        catch (error) {
            this.logger.error(`Failed to set key ${key}:`, error.message);
            throw error;
        }
    }
    async del(key) {
        try {
            const result = await this.redis.del(key);
            this.logger.debug(`Deleted key ${key} (${result} keys removed)`);
        }
        catch (error) {
            this.logger.error(`Failed to delete key ${key}:`, error.message);
            throw error;
        }
    }
    async delByPattern(pattern) {
        try {
            let cursor = '0';
            let totalRemoved = 0;
            do {
                const [nextCursor, keys] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
                if (keys.length > 0) {
                    const removed = await this.redis.del(...keys);
                    totalRemoved += removed;
                }
                cursor = nextCursor;
            } while (cursor !== '0');
            this.logger.debug(`Deleted keys by pattern ${pattern} (${totalRemoved} keys removed)`);
            return totalRemoved;
        }
        catch (error) {
            this.logger.error(`Failed to delete keys with pattern ${pattern}:`, error.message);
            throw error;
        }
    }
    async exists(key) {
        try {
            const result = await this.redis.exists(key);
            return result === 1;
        }
        catch (error) {
            this.logger.error(`Failed to check existence of key ${key}:`, error.message);
            return false;
        }
    }
    async expire(key, ttl) {
        try {
            const result = await this.redis.expire(key, ttl);
            if (result === 1) {
                this.logger.debug(`Updated TTL for key ${key} to ${ttl} seconds`);
            }
            else {
                this.logger.warn(`Key ${key} does not exist or TTL update failed`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to update TTL for key ${key}:`, error.message);
            throw error;
        }
    }
    async getTTL(key) {
        try {
            const ttl = await this.redis.ttl(key);
            return ttl;
        }
        catch (error) {
            this.logger.error(`Failed to get TTL for key ${key}:`, error.message);
            return -1;
        }
    }
    async keys(pattern) {
        try {
            return await this.redis.keys(pattern);
        }
        catch (error) {
            this.logger.error(`Failed to get keys with pattern ${pattern}:`, error.message);
            return [];
        }
    }
    async flushAll() {
        try {
            await this.redis.flushall();
            this.logger.warn('All Redis keys have been flushed');
        }
        catch (error) {
            this.logger.error('Failed to flush all keys:', error.message);
            throw error;
        }
    }
    async ping() {
        try {
            return await this.redis.ping();
        }
        catch (error) {
            this.logger.error('Redis ping failed:', error.message);
            throw error;
        }
    }
    generateKey(prefix, params) {
        const sortedParams = Object.keys(params)
            .sort()
            .reduce((acc, key) => {
            if (params[key] !== undefined) {
                acc[key] = params[key];
            }
            return acc;
        }, {});
        return `${prefix}:${JSON.stringify(sortedParams)}`;
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS')),
    __metadata("design:paramtypes", [ioredis_1.default])
], RedisService);
//# sourceMappingURL=redis.service.js.map