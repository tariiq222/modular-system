import { Module, Global } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';

// Filters
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

// Interceptors
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { CacheControlInterceptor } from './interceptors/cache-control.interceptor';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';

// Pipes
import { ValidationPipe } from './pipes/validation.pipe';

// Utils
import { Logger } from './utils';
import { ErrorLoggerService } from './utils';

@Global()
@Module({
  imports: [
    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    
    // Cache
    CacheModule.register({
      ttl: 300, // 5 minutes
      max: 100, // maximum number of items in cache
      isGlobal: true,
    }),
  ],
  providers: [
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    
    // Global Guards
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    
    // Global Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheControlInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    
    // Global Pipes
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    
    // Utils
    Logger,
    ErrorLoggerService,
  ],
  exports: [
    Logger,
    ErrorLoggerService,
    CacheModule,
    ThrottlerModule,
  ],
})
export class SharedModule {}