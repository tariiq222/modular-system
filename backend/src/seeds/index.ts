import { DataSource } from 'typeorm';
import { seedUsers } from './users.seed';
import { seedSettings } from './settings.seed';
import { seedOVRReportsData } from './ovr-reports.seed';
import { logger } from '../shared/utils/logger';

export async function runSeeds(connection: DataSource): Promise<void> {
  try {
    logger.info('بدء تجهيز البيانات الأولية...');
    
    // تنفيذ البذور بالترتيب
    await seedUsers(connection);
    await seedSettings(connection);
    await seedOVRReportsData(connection);
    
    logger.info('تم تجهيز البيانات الأولية بنجاح');
  } catch (error) {
    logger.error('فشل في تجهيز البيانات الأولية:', error);
    throw error;
  }
}