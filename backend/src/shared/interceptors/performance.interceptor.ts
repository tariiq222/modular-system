import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { logger } from '../utils/logger';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        if (responseTime > 1000) { // u062au0633u062cu064au0644 u0627u0644u0637u0644u0628u0627u062a u0627u0644u062au064a u062au0633u062au063au0631u0642 u0623u0643u062bu0631 u0645u0646 1 u062bu0627u0646u064au0629
          logger.warn(
            `u0637u0644u0628 u0628u0637u064au0621: ${method} ${url} ${responseTime}ms`,
            {
              method,
              url,
              responseTime,
              query: request.query,
              params: request.params,
              user: request.user ? request.user.id : 'anonymous',
            }
          );
        }
      }),
    );
  }
}