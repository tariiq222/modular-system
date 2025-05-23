import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        const cacheControl = this.reflector.get<number>(
          'cache-control',
          context.getHandler(),
        );

        if (cacheControl) {
          const response = context.switchToHttp().getResponse();
          response.setHeader('Cache-Control', `public, max-age=${cacheControl}`);
        }
      }),
    );
  }
}