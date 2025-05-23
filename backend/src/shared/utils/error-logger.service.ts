import { Injectable } from '@nestjs/common';
import { logger } from './logger';

export interface ErrorLog {
  id: string;
  timestamp: Date;
  level: string;
  message: string;
  stack?: string;
  context?: string;
  userId?: string;
  requestId?: string;
}

@Injectable()
export class ErrorLoggerService {
  private errorLogs: ErrorLog[] = [];
  private maxLogs = 1000; // الحد الأقصى للسجلات المحفوظة في الذاكرة

  /**
   * تسجيل خطأ جديد
   */
  logError(error: Error | string, context?: string, userId?: string, requestId?: string): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'error',
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      userId,
      requestId,
    };

    // إضافة السجل إلى المصفوفة
    this.errorLogs.unshift(errorLog);

    // الحفاظ على الحد الأقصى للسجلات
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs = this.errorLogs.slice(0, this.maxLogs);
    }

    // تسجيل الخطأ باستخدام logger
    logger.error(errorLog.message, errorLog.stack || '', context);
  }

  /**
   * الحصول على جميع سجلات الأخطاء
   */
  getAllErrorLogs(page: number = 1, limit: number = 50): { logs: ErrorLog[]; total: number } {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      logs: this.errorLogs.slice(startIndex, endIndex),
      total: this.errorLogs.length,
    };
  }

  /**
   * الحصول على سجل خطأ محدد
   */
  getErrorLogById(id: string): ErrorLog | undefined {
    return this.errorLogs.find(log => log.id === id);
  }

  /**
   * حذف سجل خطأ محدد
   */
  deleteErrorLog(id: string): boolean {
    const index = this.errorLogs.findIndex(log => log.id === id);
    if (index !== -1) {
      this.errorLogs.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * حذف جميع سجلات الأخطاء
   */
  clearAllErrorLogs(): void {
    this.errorLogs = [];
  }

  /**
   * البحث في سجلات الأخطاء
   */
  searchErrorLogs(query: string, page: number = 1, limit: number = 50): { logs: ErrorLog[]; total: number } {
    const filteredLogs = this.errorLogs.filter(log => 
      log.message.toLowerCase().includes(query.toLowerCase()) ||
      (log.context && log.context.toLowerCase().includes(query.toLowerCase())) ||
      (log.stack && log.stack.toLowerCase().includes(query.toLowerCase()))
    );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      logs: filteredLogs.slice(startIndex, endIndex),
      total: filteredLogs.length,
    };
  }

  /**
   * إحصائيات الأخطاء
   */
  getErrorStats(): { total: number; last24Hours: number; lastWeek: number } {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: this.errorLogs.length,
      last24Hours: this.errorLogs.filter(log => log.timestamp >= last24Hours).length,
      lastWeek: this.errorLogs.filter(log => log.timestamp >= lastWeek).length,
    };
  }

  /**
   * توليد معرف فريد
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}