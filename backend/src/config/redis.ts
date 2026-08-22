import Redis from 'ioredis';
import { config } from './env';

let redisClient: Redis | null = null;
let isRedisAvailable = false;

export const getRedisClient = (): Redis | null => {
  if (!redisClient) {
    try {
      redisClient = new Redis({
        host: config.redisHost,
        port: config.redisPort,
        maxRetriesPerRequest: 1,
        retryStrategy(times) {
          if (times > 3) {
            console.warn('[Redis] Max connection attempts reached. Operating in-memory mode.');
            return null;
          }
          return Math.min(times * 100, 2000);
        },
      });

      redisClient.on('connect', () => {
        isRedisAvailable = true;
        console.log('[Redis] Connected successfully.');
      });

      redisClient.on('error', (err) => {
        isRedisAvailable = false;
        console.warn(`[Redis] Notice: ${err.message}. Using fallback in-memory cache.`);
      });
    } catch (err) {
      console.warn('[Redis] Connection failed. Using fallback in-memory cache.');
    }
  }

  return isRedisAvailable ? redisClient : null;
};

// In-memory cache fallback when Redis is not running locally
const memoryCache = new Map<string, { value: string; expiresAt: number }>();

export const cacheSet = async (key: string, value: string, ttlSeconds: number = 3600): Promise<void> => {
  const client = getRedisClient();
  if (client) {
    try {
      await client.setex(key, ttlSeconds, value);
      return;
    } catch {
      // fallback to memory
    }
  }
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
};

export const cacheGet = async (key: string): Promise<string | null> => {
  const client = getRedisClient();
  if (client) {
    try {
      const val = await client.get(key);
      if (val) return val;
    } catch {
      // fallback to memory
    }
  }
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return item.value;
};
