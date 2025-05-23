import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

export const getCacheConfig = (configService: ConfigService): CacheModuleOptions => ({
  store: redisStore as any,
  host: configService.get('REDIS_HOST', 'localhost'),
  port: configService.get('REDIS_PORT', 6379),
  ttl: configService.get('CACHE_TTL', 300), // 5 minutes in seconds
  max: 100, // maximum number of items in cache
});