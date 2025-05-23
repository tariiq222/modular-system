import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // u0645u0647u0644u0629 u0627u0644u0637u0644u0628 u0628u0627u0644u0645u0644u064a u062bu0627u0646u064au0629 (u0627u0641u062au0631u0627u0636u064au0627u064b 30 u062bu0627u0646u064au0629)
    const timeoutValue = this.configService.get<number>('REQUEST_TIMEOUT', 30000);
    
    return next.handle().pipe(
      timeout(timeoutValue),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException('u0627u0646u062au0647u062a u0645u0647u0644u0629 u0627u0644u0637u0644u0628'));
        }
        return throwError(() => err);
      }),
    );
  }
}