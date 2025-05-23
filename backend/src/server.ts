import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createConnection } from 'typeorm';
import { config } from './config';
import { logger } from './shared/utils/logger';

class App {
  public app: Application;
  public port: number;

  constructor() {
    this.app = express();
    this.port = config.port;

    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Middleware للأمان
    this.app.use(helmet());
    
    // تمكين CORS
    this.app.use(cors());
    
    // لتحليل JSON
    this.app.use(express.json());
    
    // لتحليل البيانات المرسلة عبر النموذج
    this.app.use(express.urlencoded({ extended: true }));
    
    // تسجيل الطلبات
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // Route الأساسية للتأكد من أن الخادم يعمل
    this.app.get('/', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'success',
        message: 'مرحباً بك في نظام الإدارة المتكامل',
        data: {
          version: '1.0.0',
          environment: config.nodeEnv,
          timestamp: new Date().toISOString()
        }
      });
    });

    // TODO: إضافة مسارات API
    // this.app.use(`${config.apiPrefix}/auth`, authRouter);
    // this.app.use(`${config.apiPrefix}/users`, userRouter);
  }

  private initializeErrorHandling(): void {
    // معالجة الأخطاء
    this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      logger.error(err.stack);
      
      res.status(500).json({
        status: 'error',
        message: 'حدث خطأ في الخادم',
        error: config.nodeEnv === 'development' ? err.message : {}
      });
    });
  }

  private async initializeDatabase(): Promise<void> {
    try {
      const connection = await createConnection({
        type: 'postgres',
        host: config.db.host,
        port: config.db.port,
        username: config.db.username,
        password: config.db.password,
        database: config.db.database,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // تحذير: يجب تعطيله في الإنتاج
        logging: config.nodeEnv === 'development'
      });
      
      logger.info('تم الاتصال بقاعدة البيانات بنجاح');
      
      // تشغيل البذور لتجهيز البيانات الأولية
      if (config.nodeEnv !== 'production' || process.env.RUN_SEEDS === 'true') {
        const { runSeeds } = require('./seeds');
        await runSeeds(connection);
      }
    } catch (error) {
      logger.error('فشل الاتصال بقاعدة البيانات:', error);
      process.exit(1);
    }
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      logger.info(`الخادم يعمل على المنفذ ${this.port} في وضع ${config.nodeEnv}`);
    });
  }
}

// بدء التطبيق
const app = new App();
app.listen();

export default app;
