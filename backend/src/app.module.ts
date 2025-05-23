import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { MailModule } from './modules/mail/mail.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { SettingsModule } from './modules/settings/settings.module';
import { OVRReportsModule } from './modules/ovr-reports/ovr-reports.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { RateLimitModule } from './modules/rate-limit/rate-limit.module';
import { SharedModule } from './shared';

@Module({
  imports: [
    // SharedModule يجب استيراده أولاً
    SharedModule,
    
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'root'),
        database: configService.get('DB_NAME', 'modular_system'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // معطل مؤقتاً لحل مشاكل TypeORM
        logging: configService.get('NODE_ENV') === 'development',
        extra: {
          ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
        },
      }),
    }),
    UsersModule,
    AuthModule,
    ProfilesModule,
    MailModule,
    PermissionsModule,
    SettingsModule,
    OVRReportsModule,
    RbacModule,
    RateLimitModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
