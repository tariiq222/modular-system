import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof Error) {
      message = exception.message;
      
      // إذا كان الاستثناء يحتوي على status code
      if ('status' in exception) {
        status = (exception as any).status;
      } else if ('statusCode' in exception) {
        status = (exception as any).statusCode;
      }
    }

    // تسجيل الخطأ
    const logMessage = `${request.method} ${request.url} ${status} - ${message}`;
    const errorDetails = JSON.stringify({
      status,
      message,
      stack: exception instanceof Error ? exception.stack : 'No stack trace',
      userId: (request as any).user ? (request as any).user.id : 'anonymous',
      body: request.body,
      query: request.query,
      params: request.params,
      timestamp: new Date().toISOString(),
    });

    logger.error(logMessage, errorDetails, 'AllExceptionsFilter');

    // إرسال الرد
    response.status(status).json({
      status: 'error',
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}