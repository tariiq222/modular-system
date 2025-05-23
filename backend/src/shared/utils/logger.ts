import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, json } = format;

// تنسيق السجلات في وضع التطوير
const devFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  return `${timestamp} [${level}] ${message}${metaString}`;
});

// تنسيق السجلات في الإنتاج
const prodFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level}] ${message}${metaString}`;
});

export class Logger {
  private logger: WinstonLogger;

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // تكوين النقل (transports) للسجلات
    const transportsList = [
      new transports.Console({
        level: isProduction ? 'info' : 'debug',
        format: combine(
          colorize(),
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          isProduction ? prodFormat : devFormat
        ),
      }),
    ];

    // في بيئة الإنتاج، أضف نقل السجلات إلى ملفات
    if (isProduction) {
      // تطبيق ملفات التدوير اليومية
      const dailyRotateTransport = (filename: string, level: string) => {
        return new (DailyRotateFile as any)({
          filename,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level,
          format: combine(timestamp(), json()),
        });
      };

      transportsList.push(
        dailyRotateTransport('logs/application-%DATE%.log', 'info'),
        dailyRotateTransport('logs/error-%DATE%.log', 'error')
      );
    }

    this.logger = createLogger({
      level: isProduction ? 'info' : 'debug',
      format: combine(
        timestamp(),
        json()
      ),
      defaultMeta: { service: 'modular-system' },
      transports: transportsList,
      exceptionHandlers: [
        new transports.File({ filename: 'logs/exceptions.log' }),
      ],
      exitOnError: false,
    });
  }

  private formatMessage(message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    return `${timestamp} ${contextStr} ${message}`.trim();
  }

  error(message: string | Error, trace?: string | unknown, context?: string) {
    if (message instanceof Error) {
      const errorMessage = this.formatMessage(message.message, context);
      this.logger.error(errorMessage, {
        stack: message.stack,
        trace: trace || ''
      });
    } else {
      const formattedMessage = this.formatMessage(message, context);
      const traceStr = trace instanceof Error ? trace.message :
                      typeof trace === 'string' ? trace :
                      trace ? JSON.stringify(trace) : '';
      this.logger.error(formattedMessage, { trace: traceStr });
    }
  }

  warn(message: string, meta?: any, context?: string) {
    const formattedMessage = this.formatMessage(message, context);
    this.logger.warn(formattedMessage, meta || {});
  }

  info(message: string, meta?: any, context?: string) {
    const formattedMessage = this.formatMessage(message, context);
    this.logger.info(formattedMessage, meta || {});
  }

  http(message: string, meta?: any, context?: string) {
    const formattedMessage = this.formatMessage(message, context);
    this.logger.http(formattedMessage, meta || {});
  }

  debug(message: string, meta?: any, context?: string) {
    const formattedMessage = this.formatMessage(message, context);
    this.logger.debug(formattedMessage, meta || {});
  }

  verbose(message: string, meta?: any, context?: string) {
    const formattedMessage = this.formatMessage(message, context);
    this.logger.verbose(formattedMessage, meta || {});
  }

  silly(message: string, meta?: any, context?: string) {
    const formattedMessage = this.formatMessage(message, context);
    this.logger.silly(formattedMessage, meta || {});
  }
}

// إنشاء logger افتراضي
export const logger = new Logger();