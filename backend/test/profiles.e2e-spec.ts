import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { GenderType } from '../src/modules/profiles/entities/profile.entity';

describe('ProfilesController (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let userId: string;

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

    // Create a test user for profile tests
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'profile_test@example.com',
        password: 'Password123!',
        firstName: 'Profile',
        lastName: 'Test',
      })
      .expect(201);

    // Login as the test user
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'profile_test@example.com',
        password: 'Password123!',
      });

    userToken = loginResponse.body.accessToken;
    userId = loginResponse.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Profile Management', () => {
    it('/profiles/me (GET) - Should get user profile', async () => {
      return request(app.getHttpServer())
        .get('/profiles/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .then(response => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('userId');
        });
    });

    it('/profiles/me (PUT) - Should update user profile', async () => {
      const profileData = {
        bio: 'Test bio for e2e testing',
        phoneNumber: '+966501234567',
        address: 'Test Address',
        city: 'Test City',
        country: 'Test Country',
        gender: GenderType.MALE,
        profession: 'Software Tester',
        company: 'Test Company',
        website: 'https://example.com',
      };

      return request(app.getHttpServer())
        .put('/profiles/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send(profileData)
        .expect(200)
        .then(response => {
          expect(response.body).toHaveProperty('bio', profileData.bio);
          expect(response.body).toHaveProperty('phoneNumber', profileData.phoneNumber);
          expect(response.body).toHaveProperty('address', profileData.address);
          expect(response.body).toHaveProperty('city', profileData.city);
          expect(response.body).toHaveProperty('country', profileData.country);
          expect(response.body).toHaveProperty('gender', profileData.gender);
          expect(response.body).toHaveProperty('profession', profileData.profession);
          expect(response.body).toHaveProperty('company', profileData.company);
          expect(response.body).toHaveProperty('website', profileData.website);
        });
    });

    it('/profiles/me (PUT) - Should validate profile data', async () => {
      const invalidData = {
        phoneNumber: 'invalid-phone',  // Invalid phone format
        website: 'not-a-valid-url',    // Invalid URL format
      };

      return request(app.getHttpServer())
        .put('/profiles/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidData)
        .expect(400);
    });

    describe('Profile Preferences', () => {
      let preferenceId: string;

      it('/profiles/me/preferences (POST) - Should create user preference', async () => {
        const preferenceData = {
          category: 'notifications',
          key: 'email_updates',
          value: 'true',
        };

        return request(app.getHttpServer())
          .post('/profiles/me/preferences')
          .set('Authorization', `Bearer ${userToken}`)
          .send(preferenceData)
          .expect(201)
          .then(response => {
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('category', preferenceData.category);
            expect(response.body).toHaveProperty('key', preferenceData.key);
            expect(response.body).toHaveProperty('value', preferenceData.value);
            preferenceId = response.body.id;
          });
      });

      it('/profiles/me/preferences (GET) - Should get all user preferences', async () => {
        return request(app.getHttpServer())
          .get('/profiles/me/preferences')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200)
          .then(response => {
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
          });
      });

      it('/profiles/me/preferences/:category (GET) - Should get preferences by category', async () => {
        return request(app.getHttpServer())
          .get('/profiles/me/preferences/notifications')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200)
          .then(response => {
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('category', 'notifications');
          });
      });

      it('/profiles/me/preferences/:id (PUT) - Should update user preference', async () => {
        const updatedData = {
          value: 'false',
        };

        return request(app.getHttpServer())
          .put(`/profiles/me/preferences/${preferenceId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updatedData)
          .expect(200)
          .then(response => {
            expect(response.body).toHaveProperty('id', preferenceId);
            expect(response.body).toHaveProperty('value', updatedData.value);
          });
      });

      it('/profiles/me/preferences/:id (DELETE) - Should delete user preference', async () => {
        return request(app.getHttpServer())
          .delete(`/profiles/me/preferences/${preferenceId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);
      });

      it('/profiles/me/preferences/bulk (POST) - Should create multiple preferences', async () => {
        const bulkPreferences = [
          { category: 'theme', key: 'dark_mode', value: 'true' },
          { category: 'theme', key: 'font_size', value: 'medium' },
          { category: 'privacy', key: 'show_email', value: 'false' },
        ];

        return request(app.getHttpServer())
          .post('/profiles/me/preferences/bulk')
          .set('Authorization', `Bearer ${userToken}`)
          .send(bulkPreferences)
          .expect(201)
          .then(response => {
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(bulkPreferences.length);
          });
      });
    });

    describe('Profile Activities', () => {
      it('/profiles/me/activities (GET) - Should get user activities', async () => {
        return request(app.getHttpServer())
          .get('/profiles/me/activities')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200)
          .then(response => {
            expect(Array.isArray(response.body)).toBe(true);
          });
      });

      it('/profiles/me/activities/recent (GET) - Should get recent user activities', async () => {
        return request(app.getHttpServer())
          .get('/profiles/me/activities/recent')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200)
          .then(response => {
            expect(Array.isArray(response.body)).toBe(true);
          });
      });

      it('/profiles/me/activities/security (GET) - Should get security activities', async () => {
        return request(app.getHttpServer())
          .get('/profiles/me/activities/security')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200)
          .then(response => {
            expect(Array.isArray(response.body)).toBe(true);
          });
      });
    });
  });
});