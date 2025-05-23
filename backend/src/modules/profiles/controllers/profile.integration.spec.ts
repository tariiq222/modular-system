import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../app.module';
import { CreateProfileDto } from '../dtos/create-profile.dto';
import { GenderType } from '../entities/profile.entity';

// قم بإنشاء توكن JWT صالح للاختبار
const getTestToken = async (app: INestApplication) => {
  // هذا مجرد مثال، قد تحتاج إلى تعديله حسب نظام المصادقة الخاص بك
  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: 'test@example.com', password: 'password123' });
  
  return loginResponse.body.accessToken;
};

describe('Profile Integration Tests', () => {
  let app: INestApplication;
  let authToken: string;
  
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));
    
    await app.init();
    
    // الحصول على توكن للاختبار
    try {
      authToken = await getTestToken(app);
    } catch (error) {
      console.warn('لم نتمكن من الحصول على توكن الاختبار. قد تفشل اختبارات الـ API.');
      console.warn('يرجى التأكد من وجود مستخدم اختبار أو تعديل الاختبار لتجاوز المصادقة.');
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /profiles/me', () => {
    it('should return user profile', async () => {
      return request(app.getHttpServer())
        .get('/profiles/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then(response => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('userId');
        });
    });

    it('should fail without auth token', async () => {
      return request(app.getHttpServer())
        .get('/profiles/me')
        .expect(401);
    });
  });

  describe('PUT /profiles/me', () => {
    it('should update user profile', async () => {
      const updateData: Partial<CreateProfileDto> = {
        bio: 'اختبار تحديث الملف الشخصي',
        profession: 'مهندس اختبار',
        isPublic: true
      };

      return request(app.getHttpServer())
        .put('/profiles/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .then(response => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.bio).toBe(updateData.bio);
          expect(response.body.profession).toBe(updateData.profession);
          expect(response.body.isPublic).toBe(updateData.isPublic);
        });
    });

    it('should validate profile data before update', async () => {
      const invalidData = {
        phoneNumber: 'invalid-phone',
        website: 'not-a-valid-url'
      };

      return request(app.getHttpServer())
        .put('/profiles/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /profiles/me/preferences', () => {
    it('should return user preferences', async () => {
      return request(app.getHttpServer())
        .get('/profiles/me/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then(response => {
          expect(Array.isArray(response.body)).toBeTruthy();
        });
    });
  });

  describe('POST /profiles/me/preferences', () => {
    it('should create a new preference', async () => {
      const preferenceData = {
        category: 'APPEARANCE',
        key: 'theme',
        value: 'dark'
      };

      return request(app.getHttpServer())
        .post('/profiles/me/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(preferenceData)
        .expect(201)
        .then(response => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.key).toBe(preferenceData.key);
          expect(response.body.value).toBe(preferenceData.value);
        });
    });
  });

  describe('GET /profiles/me/activities', () => {
    it('should return user activities', async () => {
      return request(app.getHttpServer())
        .get('/profiles/me/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then(response => {
          expect(Array.isArray(response.body)).toBeTruthy();
        });
    });
  });

  // مثال لإضافة اختبار رفع الصورة الشخصية
  // تحتاج إلى تعديله ليتناسب مع آلية رفع الملفات في تطبيقك
  /*
  describe('POST /profiles/me/avatar', () => {
    it('should upload avatar image', async () => {
      return request(app.getHttpServer())
        .post('/profiles/me/avatar')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('avatar', 'path/to/test/image.jpg')
        .expect(201)
        .then(response => {
          expect(response.body).toHaveProperty('avatarUrl');
        });
    });
  });
  */
});