import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtAuthService } from './jwt.service';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { UserRole } from '../../users/entities/user.entity';

describe('JwtAuthService', () => {
  let service: JwtAuthService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockPayload: TokenPayload = {
    userId: '1',
    email: 'test@example.com',
    role: { name: UserRole.USER } as any,
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<JwtAuthService>(JwtAuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate an access token', async () => {
      const mockToken = 'access-token';
      const mockSecret = 'access-secret';
      const mockExpiration = '3600s';

      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'JWT_ACCESS_SECRET') return mockSecret;
        if (key === 'JWT_ACCESS_EXPIRATION') return mockExpiration;
        return null;
      });

      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.generateAccessToken(mockPayload);

      expect(configService.get).toHaveBeenCalledWith('JWT_ACCESS_SECRET');
      expect(configService.get).toHaveBeenCalledWith('JWT_ACCESS_EXPIRATION');
      expect(jwtService.signAsync).toHaveBeenCalledWith(mockPayload, {
        secret: mockSecret,
        expiresIn: mockExpiration,
      });
      expect(result).toBe(mockToken);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token', async () => {
      const mockToken = 'refresh-token';
      const mockSecret = 'refresh-secret';
      const mockExpiration = '604800s';

      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'JWT_REFRESH_SECRET') return mockSecret;
        if (key === 'JWT_REFRESH_EXPIRATION') return mockExpiration;
        return null;
      });

      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.generateRefreshToken(mockPayload);

      expect(configService.get).toHaveBeenCalledWith('JWT_REFRESH_SECRET');
      expect(configService.get).toHaveBeenCalledWith('JWT_REFRESH_EXPIRATION');
      expect(jwtService.signAsync).toHaveBeenCalledWith(mockPayload, {
        secret: mockSecret,
        expiresIn: mockExpiration,
      });
      expect(result).toBe(mockToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify an access token', async () => {
      const mockToken = 'access-token';
      const mockSecret = 'access-secret';

      mockConfigService.get.mockReturnValue(mockSecret);
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      const result = await service.verifyAccessToken(mockToken);

      expect(configService.get).toHaveBeenCalledWith('JWT_ACCESS_SECRET');
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockToken, {
        secret: mockSecret,
      });
      expect(result).toEqual(mockPayload);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a refresh token', async () => {
      const mockToken = 'refresh-token';
      const mockSecret = 'refresh-secret';

      mockConfigService.get.mockReturnValue(mockSecret);
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      const result = await service.verifyRefreshToken(mockToken);

      expect(configService.get).toHaveBeenCalledWith('JWT_REFRESH_SECRET');
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockToken, {
        secret: mockSecret,
      });
      expect(result).toEqual(mockPayload);
    });
  });
});