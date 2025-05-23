import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { User } from '../../users/entities/user.entity';
import { UserService } from '../../users/services/user.service';
import { JwtAuthService } from './jwt.service';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { LoginDto } from '../dtos/login.dto';
import { MailService } from '../../mail/services/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly jwtAuthService: JwtAuthService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    
    if (user && (await user.validatePassword(password))) {
      return user;
    }
    
    return null;
  }

  async login(loginDto: LoginDto, response: Response) {
    const { email, password } = loginDto;
    const user = await this.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('بيانات الاعتماد غير صحيحة');
    }

    // تحديث وقت آخر تسجيل دخول
    await this.userService.updateLastLogin(user.id);

    // إنشاء الرموز المميزة
    const tokens = await this.getTokens({
      userId: user.id,
      email: user.email,
      role: user.role.name as any, // Convert role entity to role name
    });

    // تعيين الرموز المميزة في ملفات تعريف الارتباط
    this.setCookies(response, tokens);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refreshToken(user: any) {
    const tokens = await this.getTokens({
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    return tokens;
  }

  async logout(response: Response) {
    response.clearCookie('Authentication');
    response.clearCookie('Refresh');
    return { message: 'تم تسجيل الخروج بنجاح' };
  }
  
  async requestResetPassword(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      // يجب عدم إظهار رسالة خطأ تدل على أن المستخدم غير موجود (لأسباب أمنية)
      return { message: 'سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' };
    }
    
    // إنشاء رمز إعادة تعيين كلمة المرور 
    const resetToken = await this.generateResetToken(user.id);
    
    try {
      // إرسال البريد الإلكتروني لإعادة تعيين كلمة المرور
      await this.mailService.sendPasswordResetEmail(user.email, resetToken);
      return { message: 'سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      // حتى في حالة فشل إرسال البريد، نعرض نفس الرسالة لتجنب تسرب معلومات أمنية
      return { message: 'سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' };
    }
  }
  
  async resetPassword(token: string, newPassword: string) {
    try {
      // التحقق من صحة الرمز
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_RESET_PASSWORD_SECRET'),
      });
      
      // تغيير كلمة المرور
      await this.userService.updatePassword(payload.userId, newPassword);
      
      // إيجاد معلومات المستخدم للإرسال
      const user = await this.userService.findOne(payload.userId);
      
      // إرسال بريد إلكتروني تأكيدي
      try {
        await this.mailService.sendPasswordResetConfirmation(user.email);
      } catch (error) {
        console.error('Error sending password reset confirmation email:', error);
        // لا نريد أن نرفض العملية إذا فشل إرسال البريد الإلكتروني التأكيدي
      }
      
      return { message: 'تم إعادة تعيين كلمة المرور بنجاح' };
    } catch (error) {
      throw new UnauthorizedException('رمز إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية');
    }
  }
  
  private async generateResetToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      { userId },
      {
        secret: this.configService.get<string>('JWT_RESET_PASSWORD_SECRET') || 'reset-password-secret',
        expiresIn: '15m', // صلاحية لمدة 15 دقيقة
      },
    );
  }

  private async getTokens(payload: TokenPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtAuthService.generateAccessToken(payload),
      this.jwtAuthService.generateRefreshToken(payload),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private setCookies(response: Response, tokens: { accessToken: string; refreshToken: string }) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    
    response.cookie('Authentication', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: (this.configService.get<number>('JWT_ACCESS_EXPIRATION') || 3600) * 1000,
    });

    response.cookie('Refresh', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/auth/refresh-token',
      maxAge: (this.configService.get<number>('JWT_REFRESH_EXPIRATION') || 1209600) * 1000,
    });
  }

  private getCookieWithJwtToken(userId: string) {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET') || 'default-access-secret';
    const accessExpiration = this.configService.get<number>('JWT_ACCESS_EXPIRATION') || 3600; // Default 1 hour
    
    const token = this.jwtService.sign(
      { userId },
      {
        secret: accessSecret,
        expiresIn: `${accessExpiration}s`,
      },
    );

    return {
      token,
      cookie: `Authentication=${token}; HttpOnly; Path=/; Max-Age=${accessExpiration * 1000}`,
    };
  }

  private getCookieWithJwtRefreshToken(userId: string) {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret';
    const refreshExpiration = this.configService.get<number>('JWT_REFRESH_EXPIRATION') || 1209600; // Default 14 days
    
    const refreshToken = this.jwtService.sign(
      { userId },
      {
        secret: refreshSecret,
        expiresIn: `${refreshExpiration}s`,
      },
    );

    return {
      refreshToken,
      cookie: `Refresh=${refreshToken}; HttpOnly; Path=/; Max-Age=${refreshExpiration * 1000}`,
    };
  }
}
