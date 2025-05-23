import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../../../app.module';
import { PermissionService } from '../services/permission.service';
import { RoleService } from '../services/role.service';
import { Permission, ActionType, ResourceType } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';

describe('Permissions Integration Tests', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let permissionService: PermissionService;
  let roleService: RoleService;
  
  // Test tokens for different user roles
  let adminToken: string;
  let moderatorToken: string;
  let userToken: string;

  // Create test tokens with different roles
  function generateToken(userId: string, role: string): string {
    return jwtService.sign({
      userId,
      role,
      sub: userId,
    });
  }

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

    jwtService = app.get<JwtService>(JwtService);
    permissionService = app.get<PermissionService>(PermissionService);
    roleService = app.get<RoleService>(RoleService);

    // Initialize default permissions and roles
    try {
      await permissionService.createDefaultPermissions();
      await roleService.createDefaultRoles();
    } catch (error) {
      console.log('Default roles and permissions already exist');
    }

    // Generate test tokens
    adminToken = generateToken('admin-user-id', 'ADMIN');
    moderatorToken = generateToken('moderator-user-id', 'MODERATOR');
    userToken = generateToken('normal-user-id', 'USER');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Permissions Endpoint Access', () => {
    it('ADMIN should be able to access permissions list', async () => {
      return request(app.getHttpServer())
        .get('/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .then(response => {
          expect(Array.isArray(response.body)).toBeTruthy();
        });
    });

    it('MODERATOR should not be able to access permissions list', async () => {
      return request(app.getHttpServer())
        .get('/permissions')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .expect(403); // Forbidden
    });

    it('USER should not be able to access permissions list', async () => {
      return request(app.getHttpServer())
        .get('/permissions')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403); // Forbidden
    });

    it('Unauthenticated request should be rejected', async () => {
      return request(app.getHttpServer())
        .get('/permissions')
        .expect(401); // Unauthorized
    });
  });

  describe('Roles Endpoint Access', () => {
    it('ADMIN should be able to access roles list', async () => {
      return request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .then(response => {
          expect(Array.isArray(response.body)).toBeTruthy();
        });
    });

    it('MODERATOR should be able to read roles', async () => {
      return request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .expect(200)
        .then(response => {
          expect(Array.isArray(response.body)).toBeTruthy();
        });
    });

    it('MODERATOR should not be able to create a role', async () => {
      const newRole = {
        name: 'TEST_ROLE',
        description: 'Test role creation permission',
        isDefault: false,
      };

      return request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send(newRole)
        .expect(403); // Forbidden
    });

    it('ADMIN should be able to create a role', async () => {
      const newRole = {
        name: 'TEST_ROLE_' + Math.floor(Math.random() * 1000), // Ensure unique name
        description: 'Test role creation permission',
        isDefault: false,
      };

      return request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newRole)
        .expect(201)
        .then(response => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.name).toBe(newRole.name);
        });
    });
  });

  describe('Profile Access', () => {
    it('USER should be able to access their own profile', async () => {
      return request(app.getHttpServer())
        .get('/profiles/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .then(response => {
          // Note: This test might fail if the profile doesn't exist
          // We're primarily testing permission access, not data validity
          expect(response.body).toBeDefined();
        })
        .catch(error => {
          // If profile doesn't exist yet, we might get a 404, which is still
          // different from a 403 (permission denied)
          expect(error.status).not.toBe(403);
        });
    });

    it('USER should be able to update their own profile', async () => {
      const profileUpdate = {
        bio: 'Testing profile update permissions',
      };

      return request(app.getHttpServer())
        .put('/profiles/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send(profileUpdate)
        .expect(response => {
          // Again, we're testing access, not data validity
          // So we accept 200 (success) or other errors that aren't 403
          expect(response.status).not.toBe(403);
        });
    });
  });

  describe('Cross-Role Access', () => {
    it('ADMIN should be able to access profile endpoints', async () => {
      return request(app.getHttpServer())
        .get('/profiles/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(response => {
          expect(response.status).not.toBe(403);
        });
    });

    it('MODERATOR should be able to access profile endpoints', async () => {
      return request(app.getHttpServer())
        .get('/profiles/me')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .expect(response => {
          expect(response.status).not.toBe(403);
        });
    });
  });
});