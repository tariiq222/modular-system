import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * u0645u0639u062au0631u0636 u0644u062au0633u062cu064au0644 u0628u064au0627u0646u0627u062a u0627u0644u0637u0644u0628u0627u062a u0648u0627u0644u0627u0633u062au062cu0627u0628u0627u062a
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'unknown';
    const userId = request.user ? (request.user as any).id : 'anonymous';

    // u062au0633u062cu064au0644 u0627u0644u0637u0644u0628 u0627u0644u0648u0627u0631u062f
    this.logger.log(
      `[${method}] ${url} - User: ${userId} - IP: ${ip} - UserAgent: ${userAgent}`,
      {
        method,
        url,
        body,
        query,
        params,
        userId,
        ip,
        userAgent,
      }
    );

    const now = Date.now();
    return next.handle().pipe(
      tap(response => {
        const responseTime = Date.now() - now;

        // u062au0633u062cu064au0644 u0627u0644u0627u0633u062au062cu0627u0628u0629 u0627u0644u0635u0627u062fu0631u0629
        this.logger.log(
          `[${method}] ${url} - ${responseTime}ms - User: ${userId}`,
          {
            method,
            url,
            responseTime,
            userId,
            statusCode: context.switchToHttp().getResponse().statusCode,
            responseSize: this.calculateResponseSize(response),
          }
        );
      })
    );
  }

  /**
   * u062du0633u0627u0628 u062du062cu0645 u0627u0644u0627u0633u062au062cu0627u0628u0629 u0628u0634u0643u0644 u062au0642u0631u064au0628u064a
   */
  private calculateResponseSize(response: any): string {
    if (!response) return '0B';
    
    try {
      const jsonString = JSON.stringify(response);
      const bytes = new TextEncoder().encode(jsonString).length;
      
      if (bytes < 1024) {
        return `${bytes}B`;
      } else if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(2)}KB`;
      } else {
        return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
      }
    } catch (error) {
      return 'unknown';
    }
  }
}