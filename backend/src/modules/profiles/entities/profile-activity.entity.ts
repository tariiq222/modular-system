import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Profile } from './profile.entity';

export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  PROFILE_UPDATE = 'profile_update',
  SETTINGS_CHANGE = 'settings_change',
  PASSWORD_RESET = 'password_reset',
  ACCOUNT_CREATION = 'account_creation',
  SESSION_EXPIRED = 'session_expired',
  FAILED_LOGIN = 'failed_login',
}

@Entity('profile_activities')
export class ProfileActivity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Profile, profile => profile.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile!: Profile;

  @Column({ name: 'profile_id' })
  profileId!: string;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  activityType!: ActivityType;

  @Column({ nullable: true, type: 'text' })
  details!: string;

  @Column({ nullable: true })
  ipAddress!: string;

  @Column({ nullable: true })
  userAgent!: string;

  @Column({ nullable: true })
  location!: string;

  @Column({ nullable: true })
  deviceInfo!: string;

  @CreateDateColumn({ name: 'timestamp' })
  @Index()
  timestamp!: Date;
}