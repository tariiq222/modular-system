import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import Redis from 'ioredis';

export interface RateLimitOptions {
  windowMs?: number;
  max?: number | ((req: Request) => Promise<number> | number);
  message?: string | any;
  statusCode?: number;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
  skipOnDevelopment?: boolean;
}

const defaultOptions: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'لقد تجاوزت الحد المسموح به من الطلبات. يرجى المحاولة لاحقاً.',
  statusCode: 429, // Too Many Requests
  keyGenerator: (req: Request) => req.ip || 'unknown', // Use IP address as the key
  skip: () => false,
  skipOnDevelopment: true,
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private limiter: any;
  private redisClient?: Redis;

  constructor(private reflector: Reflector) {
    this.initializeRedis();
    this.initializeLimiter();
  }

  private initializeRedis() {
    try {
      this.redisClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0', 10),
        enableOfflineQueue: false,
        retryStrategy: (times: number) => {
          if (times > 3) {
            return null; // End reconnecting after 3 retries
          }
          return Math.min(times * 100, 3000); // Reconnect after this delay in ms
        },
      });

      this.redisClient.on('error', (err: any) => {
        console.error('Redis error:', err);
      });
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
    }
  }

  private initializeLimiter() {
    const store = this.redisClient
      ? new RedisStore({
          sendCommand: (...args: any[]) => this.redisClient!.call(args[0], ...args.slice(1)) as Promise<any>,
        })
      : undefined;

    this.limiter = rateLimit({
      ...defaultOptions,
      store,
      handler: (req: Request, res: Response, next: any) => {
        const statusCode = defaultOptions.statusCode || 429;
        const message = typeof defaultOptions.message === 'function'
          ? defaultOptions.message(req, res)
          : defaultOptions.message;

        throw new HttpException(message, statusCode);
      },
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse();

    // Get rate limit options from the handler or class
    const options =
      this.reflector.get<RateLimitOptions>('rateLimit', context.getHandler()) ||
      this.reflector.get<RateLimitOptions>('rateLimit', context.getClass()) ||
      {};

    // Skip rate limiting for specific routes or conditions
    if (options.skip && options.skip(request)) {
      return true;
    }

    // Skip rate limiting in development if configured to do so
    if (options.skipOnDevelopment && process.env.NODE_ENV === 'development') {
      return true;
    }

    // Apply rate limiting
    return new Promise<boolean>((resolve, reject) => {
      const next = (err?: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      };

      this.limiter(request, response, next);
    });
  }
}

// Decorator for applying rate limiting to controllers or routes
export function RateLimit(options: RateLimitOptions) {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    if (descriptor) {
      // Method decorator
      Reflect.defineMetadata('rateLimit', options, descriptor.value);
      return descriptor;
    }
    // Class decorator
    Reflect.defineMetadata('rateLimit', options, target);
    return target;
  };
}
