import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { UserService } from '../../users/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthService } from '../services/jwt.service';
import { ConfigService } from '@nestjs/config';
import { HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
    validateUser: jest.fn(),
    requestResetPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  const mockUserData = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'USER'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: { findByEmail: jest.fn(), updateLastLogin: jest.fn() } },
        { provide: JwtService, useValue: { sign: jest.fn() } },
        { provide: JwtAuthService, useValue: { generateAccessToken: jest.fn(), generateRefreshToken: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: getRepositoryToken(User), useValue: {} },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should have a login method', () => {
      expect(controller.login).toBeDefined();
    });

    it('should call authService.login with correct parameters and return the result', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const result = { accessToken: 'token', refreshToken: 'token', user: mockUserData };
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn(),
      } as any;

      mockAuthService.login.mockResolvedValue(result);

      await controller.login(loginDto, response);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto, response);
      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(response.json).toHaveBeenCalledWith(result);
    });
  });

  describe('logout', () => {
    it('should have a logout method', () => {
      expect(controller.logout).toBeDefined();
    });

    it('should call authService.logout and return success message', async () => {
      const result = { message: 'تم تسجيل الخروج بنجاح' };
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        clearCookie: jest.fn(),
      } as any;

      mockAuthService.logout.mockResolvedValue(result);

      await controller.logout(response);

      expect(mockAuthService.logout).toHaveBeenCalledWith(response);
      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(response.json).toHaveBeenCalledWith(result);
    });
  });

  describe('refreshToken', () => {
    it('should have a refreshToken method', () => {
      expect(controller.refreshToken).toBeDefined();
    });

    it('should call authService.refreshToken and return new tokens', async () => {
      const user = { userId: '1', email: 'test@example.com', role: 'USER' };
      const request = { user } as any;
      const tokens = { accessToken: 'new-token', refreshToken: 'new-refresh-token' };

      mockAuthService.refreshToken.mockResolvedValue(tokens);

      const result = await controller.refreshToken(request);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(user);
      expect(result).toEqual(tokens);
    });
  });

  describe('requestResetPassword', () => {
    it('should have a requestResetPassword method', () => {
      expect(controller.requestResetPassword).toBeDefined();
    });

    it('should return success message when requesting password reset', async () => {
      const requestResetPasswordDto = { email: 'test@example.com' };
      const expectedResponse = { message: 'سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' };
      
      mockAuthService.requestResetPassword.mockResolvedValue(expectedResponse);
      const result = await controller.requestResetPassword(requestResetPasswordDto);
      
      expect(mockAuthService.requestResetPassword).toHaveBeenCalledWith(requestResetPasswordDto.email);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('resetPassword', () => {
    it('should have a resetPassword method', () => {
      expect(controller.resetPassword).toBeDefined();
    });

    it('should return success message when resetting password', async () => {
      const resetPasswordDto = { token: 'valid-token', password: 'new-password', confirmPassword: 'new-password' };
      const expectedResponse = { message: 'تم إعادة تعيين كلمة المرور بنجاح' };
      
      mockAuthService.resetPassword.mockResolvedValue(expectedResponse);
      const result = await controller.resetPassword(resetPasswordDto);
      
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(resetPasswordDto.token, resetPasswordDto.password);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getProfile', () => {
    it('should have a getProfile method', () => {
      expect(controller.getProfile).toBeDefined();
    });

    it('should return the user profile from request', () => {
      const request = { user: mockUserData } as any;
      
      const result = controller.getProfile(request);
      
      expect(result).toEqual(mockUserData);
    });
  });
});