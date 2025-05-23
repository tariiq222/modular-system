import { Controller, Post, Body, Res, HttpStatus, UseGuards, Req, Get } from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RequestResetPasswordDto, ResetPasswordDto } from '../dtos/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'تسجيل الدخول',
    description: 'تسجيل دخول المستخدم باستخدام البريد الإلكتروني وكلمة المرور'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'تم تسجيل الدخول بنجاح',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', description: 'رمز الوصول' },
        refreshToken: { type: 'string', description: 'رمز التحديث' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'بيانات الدخول غير صحيحة' })
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  async login(@Body() loginDto: LoginDto, @Res() response: Response) {
    const result = await this.authService.login(loginDto, response);
    return response.status(HttpStatus.OK).json(result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'تسجيل الخروج',
    description: 'تسجيل خروج المستخدم وإلغاء الرموز المميزة'
  })
  @ApiResponse({
    status: 200,
    description: 'تم تسجيل الخروج بنجاح',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'تم تسجيل الخروج بنجاح' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'غير مصرح بالوصول' })
  async logout(@Res() response: Response) {
    const result = await this.authService.logout(response);
    return response.status(HttpStatus.OK).json(result);
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh-token')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'تحديث الرمز المميز',
    description: 'تحديث رمز الوصول باستخدام رمز التحديث'
  })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث الرمز بنجاح',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', description: 'رمز الوصول الجديد' },
        refreshToken: { type: 'string', description: 'رمز التحديث الجديد' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'رمز التحديث غير صالح' })
  async refreshToken(@Req() request: Request) {
    const user = request.user;
    return this.authService.refreshToken(user);
  }

  @Post('request-reset-password')
  @ApiOperation({
    summary: 'طلب إعادة تعيين كلمة المرور',
    description: 'إرسال رابط إعادة تعيين كلمة المرور إلى البريد الإلكتروني'
  })
  @ApiBody({ type: RequestResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'تم إرسال رابط إعادة التعيين',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'تم إرسال رابط إعادة تعيين كلمة المرور' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'البريد الإلكتروني غير موجود' })
  async requestResetPassword(@Body() requestResetPasswordDto: RequestResetPasswordDto) {
    return this.authService.requestResetPassword(requestResetPasswordDto.email);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'إعادة تعيين كلمة المرور',
    description: 'إعادة تعيين كلمة المرور باستخدام الرمز المرسل'
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'تم تغيير كلمة المرور بنجاح',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'تم تغيير كلمة المرور بنجاح' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'الرمز غير صالح أو منتهي الصلاحية' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'الحصول على الملف الشخصي',
    description: 'الحصول على بيانات المستخدم الحالي'
  })
  @ApiResponse({
    status: 200,
    description: 'بيانات المستخدم',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        role: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'غير مصرح بالوصول' })
  getProfile(@Req() request: Request) {
    return request.user;
  }
}
