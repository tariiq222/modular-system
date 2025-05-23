import { DataSource } from 'typeorm';
import { User, UserRole } from '../modules/users/entities/user.entity';
import { Profile, GenderType } from '../modules/profiles/entities/profile.entity';
import { logger } from '../shared/utils/logger';

const defaultUsers = [
  {
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'u0645u062fu064au0631',
    lastName: 'u0627u0644u0646u0638u0627u0645',
    role: UserRole.ADMIN,
    profile: {
      bio: 'u0645u062fu064au0631 u0627u0644u0646u0638u0627u0645 u0627u0644u0631u0626u064au0633u064a',
      gender: GenderType.MALE,
      isPublic: true
    }
  },
  {
    email: 'moderator@example.com',
    password: 'moderator123',
    firstName: 'u0645u0634u0631u0641',
    lastName: 'u0645u062du062au0648u0649',
    role: UserRole.MODERATOR,
    profile: {
      bio: 'u0645u0634u0631u0641 u0645u062du062au0648u0649 u0627u0644u0646u0638u0627u0645',
      gender: GenderType.MALE,
      isPublic: true
    }
  },
  {
    email: 'user@example.com',
    password: 'user123',
    firstName: 'u0645u0633u062au062eu062fu0645',
    lastName: 'u0639u0627u062fu064a',
    role: UserRole.USER,
    profile: {
      bio: 'u0645u0633u062au062eu062fu0645 u0639u0627u062fu064a u0644u0644u0646u0638u0627u0645',
      gender: GenderType.PREFER_NOT_TO_SAY,
      isPublic: false
    }
  }
];

export async function seedUsers(connection: DataSource): Promise<void> {
  const userRepository = connection.getRepository(User);
  const profileRepository = connection.getRepository(Profile);
  
  // u0627u0644u062au062du0642u0642 u0645u0646 u0648u062cu0648u062f u0645u0633u062au062eu062fu0645u064au0646
  const existingUsers = await userRepository.count();
  
  if (existingUsers > 0) {
    logger.info(`u062au0645 u062au062eu0637u064a u0628u0630u0631 u0627u0644u0645u0633u062au062eu062fu0645u064au0646 (u064au0648u062cu062f ${existingUsers} u0645u0633u062au062eu062fu0645u064au0646 u0628u0627u0644u0641u0639u0644)`);
    return;
  }
  
  logger.info('u0628u062fu0621 u0628u0630u0631 u0627u0644u0645u0633u062au062eu062fu0645u064au0646...');
  
  for (const userData of defaultUsers) {
    try {
      // u0625u0646u0634u0627u0621 u0627u0644u0645u0633u062au062eu062fu0645
      const user = new User();
      user.email = userData.email;
      user.password = userData.password;
      user.firstName = userData.firstName;
      user.lastName = userData.lastName;
      // Find the role entity by name
      const roleRepository = connection.getRepository('Role');
      const role = await roleRepository.findOne({ where: { name: userData.role } });
      if (role) {
        user.role = role as any;
      }
      
      const savedUser = await userRepository.save(user);
      
      // u0625u0646u0634u0627u0621 u0627u0644u0645u0644u0641 u0627u0644u0634u062eu0635u064a u0627u0644u0645u0631u062au0628u0637
      const profile = new Profile();
      profile.userId = savedUser.id;
      profile.bio = userData.profile.bio;
      profile.gender = userData.profile.gender;
      profile.isPublic = userData.profile.isPublic;
      
      await profileRepository.save(profile);
      
      logger.info(`u062au0645 u0625u0646u0634u0627u0621 u0627u0644u0645u0633u062au062eu062fu0645: ${savedUser.email} (u0627u0644u062fu0648u0631: ${savedUser.role})`);
    } catch (error) {
      logger.error(`u0641u0634u0644 u0641u064a u0625u0646u0634u0627u0621 u0627u0644u0645u0633u062au062eu062fu0645 ${userData.email}:`, error);
    }
  }
  
  logger.info(`u062au0645 u0625u0646u0634u0627u0621 ${defaultUsers.length} u0645u0633u062au062eu062fu0645u064au0646 u0628u0646u062cu0627u062d`);
}