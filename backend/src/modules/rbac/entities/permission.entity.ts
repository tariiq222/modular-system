import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Role } from './role.entity';

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage', // Special action for full access
}

export enum PermissionResource {
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  REPORT = 'report',
  // Add more resources as needed
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: PermissionAction,
    nullable: false,
  })
  action!: PermissionAction;

  @Column({
    type: 'enum',
    enum: PermissionResource,
    nullable: false,
  })
  resource!: PermissionResource;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string;

  @ManyToMany(() => Role, role => role.permissions)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'permission_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles!: Role[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Helper method to check if permission matches action and resource
  matches(action: PermissionAction, resource: PermissionResource): boolean {
    return this.action === action && this.resource === resource;
  }
}
