import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'modular_system'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
        // u062eu064au0627u0631u0627u062a u0623u062fu0627u0621 u0642u0627u0639u062fu0629 u0627u0644u0628u064au0627u0646u0627u062a
        extra: {
          // u0644u0640 PostgreSQL
          max: 20, // u0627u0644u062du062f u0627u0644u0623u0642u0635u0649 u0644u0639u062fu062f u0627u0644u0627u062au0635u0627u0644u0627u062a u0641u064a pool
          idleTimeoutMillis: 30000, // u0645u062fu0629 u0627u0644u0627u0646u062au0638u0627u0631 u0642u0628u0644 u0625u063au0644u0627u0642 u0627u0644u0627u062au0635u0627u0644u0627u062a u063au064au0631 u0627u0644u0645u0633u062au062eu062fu0645u0629
          connectionTimeoutMillis: 2000, // u0645u062fu0629 u0627u0644u0627u0646u062au0638u0627u0631 u0644u0644u0627u062au0635u0627u0644 u0642u0628u0644 u0627u0644u0641u0634u0644
          ssl: configService.get('NODE_ENV') === 'production' ? 
            { rejectUnauthorized: false } : 
            false,
        },
        // u062au062du0633u064au0646 u0623u062fu0627u0621 u0642u0627u0639u062fu0629 u0627u0644u0628u064au0627u0646u0627u062a
        poolSize: 20,
        keepConnectionAlive: true,
        cache: {
          duration: 60000, // 1 u062fu0642u064au0642u0629 u0644u0644u062au062eu0632u064au0646 u0627u0644u0645u0624u0642u062a
        },
      }),
    }),
  ],
})
export class DatabaseModule {}