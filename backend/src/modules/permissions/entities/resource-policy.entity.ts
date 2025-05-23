import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Role } from './role.entity';
import { ResourceType } from './permission.entity';

/**
 * u0647u0630u0627 u0627u0644u0643u064au0627u0646 u064au0645u062bu0644 u0633u064au0627u0633u0627u062a u0627u0644u0648u0635u0648u0644 u0625u0644u0649 u0645u0648u0627u0631u062f u0645u062du062fu062fu0629 (u0627u0644u0635u0644u0627u062du064au0627u062a u0627u0644u0623u0641u0642u064au0629)
 * u0645u062bu0627u0644: u062fu0648u0631 "u0645u062fu064au0631 u0627u0644u0641u0631u064au0642" u064au0645u0643u0646u0647 u0627u0644u0648u0635u0648u0644 u0641u0642u0637 u0625u0644u0649 u0645u0633u062au062eu062fu0645u064a u0646u0641u0633 u0627u0644u0642u0633u0645 u0648u0644u064au0633 u0643u0644 u0627u0644u0645u0633u062au062eu062fu0645u064au0646
 */
@Entity('resource_policies')
export class ResourcePolicy {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Role, role => role.policies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @Column({ name: 'role_id' })
  roleId!: string;

  @Column({
    type: 'enum',
    enum: ResourceType,
    enumName: 'resource_type_enum'
  })
  @Index()
  resource!: ResourceType;

  @Column({ name: 'resource_id', nullable: true })
  @Index()
  resourceId!: string; // u0645u0639u0631u0641 u0627u0644u0645u0648u0631u062f u0627u0644u0645u062du062fu062f (u0645u062bu0644 u0645u0639u0631u0641 u0627u0644u0642u0633u0645)

  @Column({ name: 'attribute_name', nullable: true })
  attributeName!: string; // u0627u0633u0645 u0627u0644u0633u0645u0629 u0627u0644u062au064a u062au0633u062au062eu062fu0645 u0644u0644u062au0635u0641u064au0629 (u0645u062bu0644 "departmentId")

  @Column({ name: 'attribute_value', nullable: true })
  attributeValue!: string; // u0642u064au0645u0629 u0627u0644u0633u0645u0629 (u0645u062bu0644 "IT")

  @Column({ default: true })
  condition!: boolean; // u0634u0631u0637 u0627u0644u0648u0635u0648u0644 (true = u064au0633u0645u062d u0628u0627u0644u0648u0635u0648u0644u060c false = u064au0645u0646u0639 u0627u0644u0648u0635u0648u0644)

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}