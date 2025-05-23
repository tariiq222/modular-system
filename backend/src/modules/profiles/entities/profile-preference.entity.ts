import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Profile } from './profile.entity';

export enum PreferenceCategory {
  NOTIFICATIONS = 'notifications',
  PRIVACY = 'privacy',
  APPEARANCE = 'appearance',
  LANGUAGE = 'language',
  OTHER = 'other',
}

@Entity('profile_preferences')
export class ProfilePreference {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Profile, profile => profile.preferences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile!: Profile;

  @Column({ name: 'profile_id' })
  profileId!: string;

  @Column({
    type: 'enum',
    enum: PreferenceCategory,
    default: PreferenceCategory.OTHER
  })
  category!: PreferenceCategory;

  @Column()
  key!: string;

  @Column({ type: 'text' })
  value!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}