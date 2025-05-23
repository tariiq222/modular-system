import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, Index } from 'typeorm';
import { Role } from './role.entity';

export enum ActionType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',  // u0623u0639u0644u0649 u0645u0633u062au0648u0649 u0645u0646 u0627u0644u0635u0644u0627u062du064au0627u062a (u064au0634u0645u0644 u0643u0644 u0634u064au0621)
  APPROVE = 'approve',
  REJECT = 'reject',
  EXPORT = 'export',
  IMPORT = 'import',
}

export enum ResourceType {
  USER = 'user',
  PROFILE = 'profile',
  ROLE = 'role',
  PERMISSION = 'permission',
  SETTING = 'setting',
  REPORT = 'report',
  LOG = 'log',
  // u064au0645u0643u0646 u0625u0636u0627u0641u0629 u0627u0644u0645u0632u064au062f u0645u0646 u0627u0644u0645u0648u0627u0631u062f u062du0633u0628 u0627u0644u062du0627u062cu0629
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: ActionType,
  })
  @Index()
  action!: ActionType;

  @Column({
    type: 'enum',
    enum: ResourceType,
  })
  @Index()
  resource!: ResourceType;

  @Column({ length: 100, unique: true })
  @Index()
  name!: string; // u0639u0644u0649 u0633u0628u064au0644 u0627u0644u0645u062bu0627u0644 "create:user", "read:profile"

  @Column({ length: 255, nullable: true })
  description!: string;

  @ManyToMany(() => Role, role => role.permissions)
  roles!: Role[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // u0645u064au062bu0648u062f u0645u0633u0627u0639u062fu0629 u0644u0625u0646u0634u0627u0621 u0627u0633u0645 u0645u0648u062du062f u0644u0644u0635u0644u0627u062du064au0629
  static createPermissionName(action: ActionType, resource: ResourceType): string {
    return `${action}:${resource}`;
  }
}