import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

describe('MailService', () => {
  let service: MailService;
  let mailerService: MailerService;
  let configService: ConfigService;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailerService, useValue: mockMailerService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email with correct params', async () => {
      // Arrange
      const email = 'test@example.com';
      const token = 'valid-token';
      const frontendUrl = 'https://example.com';
      const supportEmail = 'support@example.com';

      mockConfigService.get.mockImplementation((key) => {
        if (key === 'FRONTEND_URL') return frontendUrl;
        if (key === 'SUPPORT_EMAIL') return supportEmail;
        return null;
      });

      mockMailerService.sendMail.mockResolvedValue(true);

      // Act
      await service.sendPasswordResetEmail(email, token);

      // Assert
      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'إعادة تعيين كلمة المرور',
        template: 'password-reset',
        context: {
          resetUrl: `${frontendUrl}/reset-password?token=${token}`,
          supportEmail,
          expiresIn: '15 دقيقة',
        },
      });
    });
  });

  describe('sendPasswordResetConfirmation', () => {
    it('should send password reset confirmation email with correct params', async () => {
      // Arrange
      const email = 'test@example.com';
      const supportEmail = 'support@example.com';

      mockConfigService.get.mockImplementation((key) => {
        if (key === 'SUPPORT_EMAIL') return supportEmail;
        return null;
      });

      mockMailerService.sendMail.mockResolvedValue(true);

      // Act
      await service.sendPasswordResetConfirmation(email);

      // Assert
      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'تم إعادة تعيين كلمة المرور',
        template: 'password-reset-confirmation',
        context: {
          supportEmail,
        },
      });
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with correct params', async () => {
      // Arrange
      const email = 'test@example.com';
      const firstName = 'Test';
      const supportEmail = 'support@example.com';

      mockConfigService.get.mockImplementation((key) => {
        if (key === 'SUPPORT_EMAIL') return supportEmail;
        return null;
      });

      mockMailerService.sendMail.mockResolvedValue(true);

      // Act
      await service.sendWelcomeEmail(email, firstName);

      // Assert
      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'مرحباً بك في نظام إدارة المستخدمين',
        template: 'welcome',
        context: {
          firstName,
          supportEmail,
        },
      });
    });
  });

  describe('sendLoginNotification', () => {
    it('should send login notification email with correct params', async () => {
      // Arrange
      const email = 'test@example.com';
      const deviceInfo = 'Chrome on Windows';
      const location = 'New York, USA';
      const supportEmail = 'support@example.com';

      mockConfigService.get.mockImplementation((key) => {
        if (key === 'SUPPORT_EMAIL') return supportEmail;
        return null;
      });

      mockMailerService.sendMail.mockResolvedValue(true);
      jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('2023-01-01 12:00:00');

      // Act
      await service.sendLoginNotification(email, deviceInfo, location);

      // Assert
      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'تسجيل دخول جديد',
        template: 'login-notification',
        context: {
          deviceInfo,
          location,
          time: expect.any(String),
          supportEmail,
        },
      });
    });
  });
});