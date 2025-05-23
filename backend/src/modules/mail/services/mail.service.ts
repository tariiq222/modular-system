import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * إرسال بريد إلكتروني لإعادة تعيين كلمة المرور
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${token}`;
    
    await this.mailerService.sendMail({
      to: email,
      subject: 'إعادة تعيين كلمة المرور',
      template: 'password-reset',
      context: {
        resetUrl,
        supportEmail: this.configService.get('SUPPORT_EMAIL', 'support@userms.com'),
        expiresIn: '15 دقيقة',
      },
    });
  }

  /**
   * إرسال بريد إلكتروني لتأكيد إعادة تعيين كلمة المرور
   */
  async sendPasswordResetConfirmation(email: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'تم إعادة تعيين كلمة المرور',
      template: 'password-reset-confirmation',
      context: {
        supportEmail: this.configService.get('SUPPORT_EMAIL', 'support@userms.com'),
      },
    });
  }

  /**
   * إرسال بريد إلكتروني للترحيب بالمستخدم الجديد
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'مرحباً بك في نظام إدارة المستخدمين',
      template: 'welcome',
      context: {
        firstName,
        supportEmail: this.configService.get('SUPPORT_EMAIL', 'support@userms.com'),
      },
    });
  }

  /**
   * إرسال إشعار بتسجيل الدخول من جهاز جديد
   */
  async sendLoginNotification(email: string, deviceInfo: string, location: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'تسجيل دخول جديد',
      template: 'login-notification',
      context: {
        deviceInfo,
        location,
        time: new Date().toLocaleString('ar-SA'),
        supportEmail: this.configService.get('SUPPORT_EMAIL', 'support@userms.com'),
      },
    });
  }
}