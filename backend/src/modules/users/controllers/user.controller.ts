import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Public } from '../../../shared/decorators/public.decorator';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards()
  @Public()
  @ApiOperation({
    summary: 'إنشاء مستخدم جديد',
    description: 'تسجيل مستخدم جديد في النظام (متاح للجميع)'
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء المستخدم بنجاح',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        role: { type: 'string', enum: ['USER', 'ADMIN', 'MODERATOR'] }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 409, description: 'البريد الإلكتروني مستخدم بالفعل' })
  async create(@Body() createUserDto: CreateUserDto) {
    // تعيين دور المستخدم الجديد كـ USER افتراضيًا
    const user = await this.userService.create({
      ...createUserDto,
      role: UserRole.USER
    });
    return user;
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'الحصول على جميع المستخدمين',
    description: 'عرض قائمة بجميع المستخدمين (للمديرين فقط)'
  })
  @ApiResponse({
    status: 200,
    description: 'قائمة المستخدمين',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'غير مصرح بالوصول' })
  @ApiResponse({ status: 403, description: 'ليس لديك صلاحية' })
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'الحصول على مستخدم محدد',
    description: 'عرض بيانات مستخدم محدد (المستخدم يمكنه رؤية بياناته فقط)'
  })
  @ApiParam({ name: 'id', description: 'معرف المستخدم' })
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
        role: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'غير مصرح بالوصول' })
  @ApiResponse({ status: 403, description: 'ليس لديك صلاحية' })
  @ApiResponse({ status: 404, description: 'المستخدم غير موجود' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    // يسمح للمستخدمين بالوصول إلى بياناتهم فقط ما لم يكن لديهم صلاحية ADMIN
    if (req.user.role !== UserRole.ADMIN && req.user.userId !== id) {
      throw new ForbiddenException('غير مصرح لك بالوصول إلى هذا المورد');
    }
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'تحديث بيانات مستخدم',
    description: 'تحديث بيانات مستخدم محدد (المستخدم يمكنه تحديث بياناته فقط)'
  })
  @ApiParam({ name: 'id', description: 'معرف المستخدم' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث المستخدم بنجاح',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        role: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'غير مصرح بالوصول' })
  @ApiResponse({ status: 403, description: 'ليس لديك صلاحية' })
  @ApiResponse({ status: 404, description: 'المستخدم غير موجود' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any
  ) {
    // يسمح للمستخدمين بتحديث بياناتهم فقط ما لم يكن لديهم صلاحية ADMIN
    if (req.user.role !== UserRole.ADMIN && req.user.userId !== id) {
      throw new ForbiddenException('غير مصرح لك بتحديث هذا المستخدم');
    }
    
    // لا يمكن للمستخدمين العاديين تغيير أدوارهم
    if (req.user.role !== UserRole.ADMIN && updateUserDto.role) {
      delete updateUserDto.role;
    }
    
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'حذف مستخدم',
    description: 'حذف مستخدم من النظام (للمديرين فقط)'
  })
  @ApiParam({ name: 'id', description: 'معرف المستخدم' })
  @ApiResponse({
    status: 200,
    description: 'تم حذف المستخدم بنجاح',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'تم حذف المستخدم بنجاح' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'غير مصرح بالوصول' })
  @ApiResponse({ status: 403, description: 'ليس لديك صلاحية' })
  @ApiResponse({ status: 404, description: 'المستخدم غير موجود' })
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
