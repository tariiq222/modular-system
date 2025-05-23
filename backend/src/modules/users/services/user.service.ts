import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserWithoutPassword } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    // التحقق من وجود مستخدم بنفس البريد الإلكتروني
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('البريد الإلكتروني مسجل مسبقاً');
    }

    // إنشاء مستخدم جديد
    const user = await this.userRepository.createUser(createUserDto);
    
    // إرجاع بيانات المستخدم بدون كلمة المرور
    const { password, ...result } = user;
    return result as UserWithoutPassword;
  }

  async findAll(): Promise<UserWithoutPassword[]> {
    const users = await this.userRepository.find();
    return users.map(({ password, ...user }) => user as UserWithoutPassword);
  }

  async findOne(id: string): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    
    const { password, ...result } = user;
    return result as UserWithoutPassword;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserWithoutPassword> {
    let user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    // التحقق من كلمة المرور الحالية إذا تم توفير كلمة مرور جديدة
    if (updateUserDto.newPassword) {
      if (!updateUserDto.currentPassword) {
        throw new BadRequestException('يجب إدخال كلمة المرور الحالية');
      }
      
      const isPasswordValid = await user.validatePassword(updateUserDto.currentPassword);
      if (!isPasswordValid) {
        throw new BadRequestException('كلمة المرور الحالية غير صحيحة');
      }
      
      // تحديث كلمة المرور
      user.password = updateUserDto.newPassword;
    }

    // تحديث الحقول الأخرى
    const updateData: Partial<User> = {};
    if (updateUserDto.firstName !== undefined) updateData.firstName = updateUserDto.firstName;
    if (updateUserDto.lastName !== undefined) updateData.lastName = updateUserDto.lastName;
    if (updateUserDto.role !== undefined) {
      // Find the role entity by name
      const roleRepository = this.userRepository.manager.getRepository('Role');
      const role = await roleRepository.findOne({ where: { name: updateUserDto.role } });
      if (role) {
        updateData.role = role as any;
      }
    }
    if (updateUserDto.isActive !== undefined) updateData.isActive = updateUserDto.isActive;

    const updatedUser = await this.userRepository.updateUser(id, updateData);
    if (!updatedUser) {
      throw new NotFoundException('فشل تحديث بيانات المستخدم');
    }

    const { password, ...result } = updatedUser;
    return result as UserWithoutPassword;
  }

  async remove(id: string): Promise<void> {
    const success = await this.userRepository.deleteUser(id);
    if (!success) {
      throw new NotFoundException('المستخدم غير موجود');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async updateLastLogin(userId: string): Promise<boolean> {
    await this.userRepository.updateLastLogin(userId);
    return true;
  }
  
  async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    
    user.password = newPassword;
    await this.userRepository.save(user);
    return true;
  }
}
