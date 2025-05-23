import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // الحصول على رسالة الخطأ
    const exceptionResponse = exception.getResponse ? exception.getResponse() : exception.message;
    let message = '';
    let errors = [];

    if (typeof exceptionResponse === 'object') {
      message = (exceptionResponse as any).message || exception.message;
      errors = (exceptionResponse as any).errors || [];
    } else {
      message = exceptionResponse || exception.message;
    }

    // تسجيل الخطأ
    const logMessage = `${request.method} ${request.url} ${status} - ${message}`;
    const logData = {
      status,
      message,
      errors,
      stack: exception.stack,
      userId: (request as any).user ? (request as any).user.id : 'anonymous',
      body: request.body,
      query: request.query,
      params: request.params,
    };

    if (status >= 500) {
      logger.error(logMessage, JSON.stringify(logData), 'HttpExceptionFilter');
    } else if (status >= 400) {
      logger.warn(logMessage, {
        status,
        message,
        errors,
        userId: (request as any).user ? (request as any).user.id : 'anonymous',
      }, 'HttpExceptionFilter');
    }

    // إرسال الرد
    response.status(status).json({
      status: 'error',
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      errors: errors.length ? errors : undefined,
    });
  }
}