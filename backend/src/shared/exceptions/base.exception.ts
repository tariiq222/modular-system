import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * الفئة الأساسية للأخطاء المخصصة في التطبيق
 */
export class BaseException extends HttpException {
  /**
   * رمز الخطأ المخصص للتطبيق
   */
  errorCode: string;
  
  /**
   * معلومات إضافية عن الخطأ
   */
  details?: any;

  constructor(
    message: string,
    status: HttpStatus,
    errorCode: string,
    details?: any,
  ) {
    super(
      {
        message,
        errorCode,
        details,
      },
      status,
    );
    this.errorCode = errorCode;
    this.details = details;
  }
}