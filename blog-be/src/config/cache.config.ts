export interface CacheConfig {
  ttl: number;
  maxItems: number;
  saltRounds: number;
}

export const cacheConfig: CacheConfig = {
  ttl: parseInt(process.env.REDIS_TTL || '60', 10),
  maxItems: parseInt(process.env.REDIS_MAX_ITEMS || '500', 10),
  saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
};
