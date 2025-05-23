import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('DB_HOST', 'localhost'),
            port: configService.get<number>('DB_PORT', 5432),
            username: configService.get('DB_USERNAME', 'postgres'),
            password: configService.get('DB_PASSWORD', 'postgres'),
            database: configService.get('DB_DATABASE', 'test_db'),
            entities: ['src/**/*.entity{.ts,.js}'],
            synchronize: true,
          }),
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Create a test user for authentication tests
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test_auth@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('/auth/login (POST) - should login successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test_auth@example.com',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', 'test_auth@example.com');
      expect(response.body.user).not.toHaveProperty('password');

      userToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('/auth/login (POST) - should fail with invalid credentials', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test_auth@example.com',
          password: 'WrongPassword!',
        })
        .expect(401);
    });

    it('/auth/me (GET) - should return user profile with valid token', async () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .then(response => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('email', 'test_auth@example.com');
          expect(response.body).not.toHaveProperty('password');
        });
    });

    it('/auth/me (GET) - should fail without token', async () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('/auth/refresh-token (POST) - should refresh tokens', async () => {
      return request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Cookie', [`Refresh=${refreshToken}`])
        .expect(200)
        .then(response => {
          expect(response.body).toHaveProperty('accessToken');
          expect(response.body).toHaveProperty('refreshToken');
          
          // Update tokens for further tests
          userToken = response.body.accessToken;
          refreshToken = response.body.refreshToken;
        });
    });

    it('/auth/logout (POST) - should logout successfully', async () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .then(response => {
          expect(response.body).toHaveProperty('message');
          // Check cookies are cleared
          const cookies = response.headers['set-cookie'];
          expect(cookies).toBeDefined();
          expect(Array.isArray(cookies) && cookies.some((cookie: string) => cookie.startsWith('Authentication=;'))).toBeTruthy();
          expect(Array.isArray(cookies) && cookies.some((cookie: string) => cookie.startsWith('Refresh=;'))).toBeTruthy();
        });
    });
  });

  describe('Password Reset', () => {
    it('/auth/forgot-password (POST) - should request password reset', async () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'test_auth@example.com',
        })
        .expect(200)
        .then(response => {
          expect(response.body).toHaveProperty('message');
        });
    });

    // Note: Testing actual password reset would require intercepting emails or mocking token verification
    // This is just a simple test to ensure the endpoint responds correctly
    it('/auth/reset-password (POST) - should validate token format', async () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'NewPassword123!',
        })
        .expect(401); // Unauthorized due to invalid token
    });
  });
});