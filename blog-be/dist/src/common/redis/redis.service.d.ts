import IORedis from 'ioredis';
export declare class RedisService {
    private redis;
    private readonly logger;
    constructor(redis: IORedis);
    private testConnection;
    get<T>(key: string): Promise<T | undefined>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    expire(key: string, ttl: number): Promise<void>;
    getTTL(key: string): Promise<number>;
    keys(pattern: string): Promise<string[]>;
    flushAll(): Promise<void>;
    ping(): Promise<string>;
    generateKey(prefix: string, params: Record<string, any>): string;
}
