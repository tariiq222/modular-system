import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany, Index } from 'typeorm';
import { Permission } from './permission.entity';
import { User } from '../../users/entities/user.entity';
import { ResourcePolicy } from './resource-policy.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 50, unique: true })
  @Index()
  name!: string;

  @Column({ length: 255, nullable: true })
  description!: string;

  @Column({ default: false })
  isSystem!: boolean; // للأدوار المدمجة في النظام

  @Column({ default: false })
  isDefault!: boolean; // هل يتم تعيين هذا الدور افتراضيًا للمستخدمين الجدد

  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions!: Permission[];

  @OneToMany(() => ResourcePolicy, policy => policy.role)
  policies!: ResourcePolicy[];

  // العلاقة مع المستخدمين موجودة في كيان المستخدم

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}