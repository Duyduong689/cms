import { Inject, Injectable, Logger } from '@nestjs/common';
import IORedis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject('REDIS') private redis: IORedis) {
    this.testConnection();
  }

  private async testConnection(): Promise<void> {
    try {
      await this.redis.set('test:connection', 'ok', 'EX', 1);
      const result = await this.redis.get('test:connection');
      if (result === 'ok') {
        this.logger.log('Redis connection established successfully');
        await this.redis.del('test:connection');
      } else {
        this.logger.error('Redis connection test failed - value not retrieved');
      }
    } catch (error) {
      this.logger.error('Redis connection failed:', error.message);
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.redis.get(key);
      if (value === null) {
        return undefined;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Failed to get key ${key}:`, error.message);
      return undefined;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.redis.set(key, serializedValue, 'EX', ttl);
      } else {
        await this.redis.set(key, serializedValue);
      }
      this.logger.debug(`Set key ${key} with TTL ${ttl || 'no expiration'}`);
    } catch (error) {
      this.logger.error(`Failed to set key ${key}:`, error.message);
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      const result = await this.redis.del(key);
      this.logger.debug(`Deleted key ${key} (${result} keys removed)`);
    } catch (error) {
      this.logger.error(`Failed to delete key ${key}:`, error.message);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check existence of key ${key}:`, error.message);
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      const result = await this.redis.expire(key, ttl);
      if (result === 1) {
        this.logger.debug(`Updated TTL for key ${key} to ${ttl} seconds`);
      } else {
        this.logger.warn(`Key ${key} does not exist or TTL update failed`);
      }
    } catch (error) {
      this.logger.error(`Failed to update TTL for key ${key}:`, error.message);
      throw error;
    }
  }


  async getTTL(key: string): Promise<number> {
    try {
      const ttl = await this.redis.ttl(key);
      return ttl;
    } catch (error) {
      this.logger.error(`Failed to get TTL for key ${key}:`, error.message);
      return -1;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      this.logger.error(`Failed to get keys with pattern ${pattern}:`, error.message);
      return [];
    }
  }

  async flushAll(): Promise<void> {
    try {
      await this.redis.flushall();
      this.logger.warn('All Redis keys have been flushed');
    } catch (error) {
      this.logger.error('Failed to flush all keys:', error.message);
      throw error;
    }
  }

  async ping(): Promise<string> {
    try {
      return await this.redis.ping();
    } catch (error) {
      this.logger.error('Redis ping failed:', error.message);
      throw error;
    }
  }

  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        if (params[key] !== undefined) {
          acc[key] = params[key];
        }
        return acc;
      }, {} as Record<string, any>);

    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }
}
