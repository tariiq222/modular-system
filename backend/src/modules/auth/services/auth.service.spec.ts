import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthService } from './jwt.service';
import { UserService } from '../../users/services/user.service';
import { MailService } from '../../mail/services/mail.service';
import { User, UserRole } from '../../users/entities/user.entity';
import { LoginDto } from '../dtos/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let jwtAuthService: JwtAuthService;
  let configService: ConfigService;
  let mailService: MailService;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    role: { name: UserRole.USER } as any,
    isActive: true,
    status: 'active' as any,
    emailVerified: false,
    mustChangePassword: false,
    failedLoginAttempts: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    hashPassword: jest.fn(),
    validatePassword: jest.fn(),
    toJSON: jest.fn(),
  } as any;

  const mockUserService = {
    findByEmail: jest.fn(),
    updateLastLogin: jest.fn(),
    findOne: jest.fn(),
    updatePassword: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockJwtAuthService = {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockMailService = {
    sendPasswordResetEmail: jest.fn(),
    sendPasswordResetConfirmation: jest.fn(),
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: JwtAuthService,
          useValue: mockJwtAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    jwtAuthService = module.get<JwtAuthService>(JwtAuthService);
    configService = module.get<ConfigService>(ConfigService);
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return a user if validation is successful', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (mockUser.validatePassword as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(mockUserService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUser.validatePassword).toHaveBeenCalledWith('password123');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password123');

      expect(mockUserService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (mockUser.validatePassword as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(mockUserService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUser.validatePassword).toHaveBeenCalledWith('wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should login successfully and return user data with tokens', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
      mockUserService.updateLastLogin.mockResolvedValue(true);
      mockJwtAuthService.generateAccessToken.mockResolvedValue(tokens.accessToken);
      mockJwtAuthService.generateRefreshToken.mockResolvedValue(tokens.refreshToken);

      const result = await service.login(loginDto, mockResponse);

      expect(service.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(mockUserService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
      expect(mockJwtAuthService.generateAccessToken).toHaveBeenCalled();
      expect(mockJwtAuthService.generateRefreshToken).toHaveBeenCalled();
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
        },
        ...tokens,
      });
    });

    it('should throw UnauthorizedException if user validation fails', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(service.login(loginDto, mockResponse)).rejects.toThrow(UnauthorizedException);
      expect(service.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(mockUserService.updateLastLogin).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens', async () => {
      const user = {
        userId: '1',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const tokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockJwtAuthService.generateAccessToken.mockResolvedValue(tokens.accessToken);
      mockJwtAuthService.generateRefreshToken.mockResolvedValue(tokens.refreshToken);

      const result = await service.refreshToken(user);

      expect(mockJwtAuthService.generateAccessToken).toHaveBeenCalledWith({
        userId: user.userId,
        email: user.email,
        role: user.role,
      });
      expect(mockJwtAuthService.generateRefreshToken).toHaveBeenCalledWith({
        userId: user.userId,
        email: user.email,
        role: user.role,
      });
      expect(result).toEqual(tokens);
    });
  });

  describe('logout', () => {
    it('should clear cookies and return success message', async () => {
      const result = await service.logout(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('Authentication');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('Refresh');
      expect(result).toEqual({ message: 'تم تسجيل الخروج بنجاح' });
    });
  });

  describe('requestResetPassword', () => {
    it('should generate a reset token and send email for existing user', async () => {
      const email = 'test@example.com';
      const resetToken = 'reset-token';

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(resetToken);
      mockMailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      const result = await service.requestResetPassword(email);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockJwtService.signAsync).toHaveBeenCalled();
      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalledWith(email, resetToken);
      expect(result).toEqual({ message: 'سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' });
    });

    it('should return the same message for non-existent user (security measure)', async () => {
      const email = 'nonexistent@example.com';

      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await service.requestResetPassword(email);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
      expect(mockMailService.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' });
    });
  });

  describe('resetPassword', () => {
    it('should reset password when token is valid', async () => {
      const token = 'valid-token';
      const newPassword = 'newPassword123';
      const payload = { userId: '1' };

      mockJwtService.verifyAsync.mockResolvedValue(payload);
      mockUserService.updatePassword.mockResolvedValue(true);
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockMailService.sendPasswordResetConfirmation.mockResolvedValue(undefined);

      const result = await service.resetPassword(token, newPassword);

      expect(mockJwtService.verifyAsync).toHaveBeenCalled();
      expect(mockUserService.updatePassword).toHaveBeenCalledWith(payload.userId, newPassword);
      expect(mockUserService.findOne).toHaveBeenCalledWith(payload.userId);
      expect(mockMailService.sendPasswordResetConfirmation).toHaveBeenCalledWith(mockUser.email);
      expect(result).toEqual({ message: 'تم إعادة تعيين كلمة المرور بنجاح' });
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      const token = 'invalid-token';
      const newPassword = 'newPassword123';

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(UnauthorizedException);
      expect(mockJwtService.verifyAsync).toHaveBeenCalled();
      expect(mockUserService.updatePassword).not.toHaveBeenCalled();
      expect(mockUserService.findOne).not.toHaveBeenCalled();
      expect(mockMailService.sendPasswordResetConfirmation).not.toHaveBeenCalled();
    });
  });
});