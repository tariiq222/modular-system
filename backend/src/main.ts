// يجب أن يكون هذا أول استيراد في التطبيق
import 'module-alias/register';
import moduleAlias from 'module-alias';

// تحميل إعدادات الأسماء المستعارة
moduleAlias.addAliases({
  '@app': __dirname,
  '@modules': `${__dirname}/modules`,
  '@shared': `${__dirname}/shared`,
  '@auth': `${__dirname}/modules/auth`,
  '@users': `${__dirname}/modules/users`
});
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { AppModule } from '@app/app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';

  // Middleware
  app.use(helmet({
    contentSecurityPolicy: isProduction ? undefined : false,
    crossOriginEmbedderPolicy: isProduction,
    crossOriginOpenerPolicy: isProduction,
    crossOriginResourcePolicy: isProduction
  }));
  app.use(compression());
  app.use(cookieParser());
  app.use(morgan(isProduction ? 'combined' : 'dev'));

  // Enable CORS
  app.enableCors({
    origin: isProduction ? ['https://yourdomain.com'] : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters and interceptors are now configured in ErrorHandlingModule
  // app.useGlobalFilters(new HttpExceptionFilter());
  
  // Performance monitoring
  const performanceInterceptor = app.get(ConfigService).get('NODE_ENV') !== 'production'
    ? new (require('./shared/interceptors/performance.interceptor').PerformanceInterceptor)()
    : null;
  
  if (performanceInterceptor) {
    app.useGlobalInterceptors(performanceInterceptor);
  }

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('نظام الإدارة المتكامل API')
    .setDescription('توثيق واجهة برمجة التطبيقات للنظام المتكامل ذو الوحدات القابلة للتوسع')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .addTag('auth', 'عمليات المصادقة وإدارة الجلسات')
    .addTag('users', 'إدارة المستخدمين')
    .addTag('profiles', 'إدارة الملفات الشخصية')
    .addTag('permissions', 'إدارة الصلاحيات والأدوار')
    .addTag('ovr-reports', 'إدارة تقارير الحوادث والمخاطر')
    .addTag('settings', 'إعدادات النظام')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'API Documentation - نظام الإدارة المتكامل',
  });

  await app.listen(port);
  
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Environment: ${nodeEnv}`);
}

bootstrap().catch((err) => {
  console.error('Error during application startup', err);
  process.exit(1);
});
