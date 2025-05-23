import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let testUserId: string;

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

    // Create admin user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin_test@example.com',
        password: 'AdminPassword123!',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
      })
      .expect(201);

    // Create regular user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user_test@example.com',
        password: 'UserPassword123!',
        firstName: 'Regular',
        lastName: 'User',
      })
      .expect(201);

    // Login as admin
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin_test@example.com',
        password: 'AdminPassword123!',
      });

    adminToken = adminLoginResponse.body.accessToken;

    // Login as regular user
    const userLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user_test@example.com',
        password: 'UserPassword123!',
      });

    userToken = userLoginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User Management', () => {
    it('/users (POST) - Admin should create a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'new_test_user@example.com',
          password: 'NewUserPassword123!',
          firstName: 'New',
          lastName: 'TestUser',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', 'new_test_user@example.com');
      expect(response.body).not.toHaveProperty('password');

      testUserId = response.body.id;
    });

    it('/users (GET) - Admin should get all users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3); // At least 3 users: admin, regular, and new test user
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).not.toHaveProperty('password');
    });

    it('/users (GET) - Regular user should be forbidden', async () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('/users/:id (GET) - Admin should get a specific user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testUserId);
      expect(response.body).toHaveProperty('email', 'new_test_user@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    it('/users/:id (PUT) - Admin should update a user', async () => {
      const response = await request(app.getHttpServer())
        .put(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
        })
        .expect(200);

      expect(response.body).toHaveProperty('id', testUserId);
      expect(response.body).toHaveProperty('firstName', 'Updated');
      expect(response.body).toHaveProperty('lastName', 'Name');
    });

    it('/users/:id (PUT) - Regular user should be forbidden from updating others', async () => {
      return request(app.getHttpServer())
        .put(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Unauthorized',
          lastName: 'Update',
        })
        .expect(403);
    });

    it('/users/:id (DELETE) - Admin should delete a user', async () => {
      return request(app.getHttpServer())
        .delete(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('/users/:id (GET) - Should return 404 for deleted user', async () => {
      return request(app.getHttpServer())
        .get(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});