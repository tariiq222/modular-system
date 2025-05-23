import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UserRepository extends Repository<User> {
  // طرق محسنة للبحث في قاعدة البيانات
  
  /**
   * البحث عن مستخدم مع تحميل بياناته الشخصية
   */
  async findUserWithProfile(userId: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  /**
   * البحث عن مستخدم بالبريد الإلكتروني
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password') // للتأكد من تضمين كلمة المرور المشفرة
      .getOne();
  }

  /**
   * البحث عن مستخدم بالمعرف
   */
  async findById(id: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();
  }

  /**
   * إنشاء مستخدم جديد
   */
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const userData: Partial<User> = {
      email: createUserDto.email,
      password: createUserDto.password,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      // role سيتم تعيينه من خلال roleId
    };
    
    const user = this.create(userData);
    return this.save(user);
  }

  /**
   * تحديث مستخدم
   */
  async updateUser(id: string, updateData: Partial<User>): Promise<User | null> {
    await this.update(id, updateData);
    return this.findById(id);
  }

  /**
   * حذف مستخدم
   */
  async deleteUser(id: string): Promise<boolean> {
    const result = await this.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * تحديث آخر تسجيل دخول
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.update(userId, { lastLoginAt: new Date() });
  }

  /**
   * الحصول على قائمة المستخدمين بشكل صفحات
   */
  async findAllPaginated(page: number = 1, limit: number = 10, role?: string): Promise<[User[], number]> {
    const query = this.createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.firstName', 'user.lastName', 'user.role', 'user.status', 'user.createdAt'])
      .skip((page - 1) * limit)
      .take(limit);

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    return query.getManyAndCount();
  }

  /**
   * البحث في المستخدمين
   */
  async searchUsers(term: string, page: number = 1, limit: number = 10): Promise<[User[], number]> {
    const query = this.createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.firstName', 'user.lastName', 'user.role'])
      .where('user.email ILIKE :term OR user.firstName ILIKE :term OR user.lastName ILIKE :term', {
        term: `%${term}%`,
      })
      .skip((page - 1) * limit)
      .take(limit);

    return query.getManyAndCount();
  }
}