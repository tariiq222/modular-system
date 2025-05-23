import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProfilePreference } from './profile-preference.entity';
import { ProfileActivity } from './profile-activity.entity';

export enum GenderType {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string = '';
  user: User | null = null;
  userId: string = '';
  bio: string = '';
  avatar: string = '';
  phoneNumber: string = '';
  address: string = '';
  city: string = '';
  country: string = '';
  postalCode: string = '';
  gender: GenderType = GenderType.PREFER_NOT_TO_SAY;
  birthDate: Date = new Date();
  profession: string = '';
  company: string = '';
  website: string = '';
  facebookUrl: string = '';
  twitterUrl: string = '';
  linkedinUrl: string = '';
  instagramUrl: string = '';
  isPublic: boolean = false;
  preferences: ProfilePreference[] = [];
  activities: ProfileActivity[] = [];
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}