import { DataSource } from 'typeorm';
import { logger } from '../shared/utils/logger';

// u0633u0646u0642u0648u0645 u0628u0625u0646u0634u0627u0621 u0643u064au0627u0646 u0644u0644u0625u0639u062fu0627u062fu0627u062a u0623u0648u0644u0627u064b
export async function seedSettings(connection: DataSource): Promise<void> {
  try {
    // u0627u0644u062au062du0642u0642 u0645u0646 u0648u062cu0648u062f u062cu062fu0648u0644 u0627u0644u0625u0639u062fu0627u062fu0627u062a
    const tableExists = await connection.query(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables 
         WHERE table_name = 'system_settings'
       )`
    );
    
    if (!tableExists[0].exists) {
      // u0625u0646u0634u0627u0621 u062cu062fu0648u0644 u0627u0644u0625u0639u062fu0627u062fu0627u062a u0625u0630u0627 u0644u0645 u064au0643u0646 u0645u0648u062cu0648u062fu0627u064b
      await connection.query(`
        CREATE TABLE system_settings (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) NOT NULL UNIQUE,
          value TEXT,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      logger.info('u062au0645 u0625u0646u0634u0627u0621 u062cu062fu0648u0644 u0627u0644u0625u0639u062fu0627u062fu0627u062a');
    }
    
    // u0627u0644u0625u0639u062fu0627u062fu0627u062a u0627u0644u0627u0641u062au0631u0627u0636u064au0629
    const defaultSettings = [
      {
        key: 'SITE_NAME',
        value: 'u0646u0638u0627u0645 u0627u0644u0625u062fu0627u0631u0629 u0627u0644u0645u062au0643u0627u0645u0644',
        description: 'u0627u0633u0645 u0627u0644u0645u0648u0642u0639 u0627u0644u0630u064a u064au0638u0647u0631 u0641u064a u0627u0644u0648u0627u062cu0647u0629'
      },
      {
        key: 'SITE_DESCRIPTION',
        value: 'u0646u0638u0627u0645 u0645u062au0643u0627u0645u0644 u0644u0625u062fu0627u0631u0629 u0627u0644u0645u062du062au0648u0649 u0648u0627u0644u0645u0633u062au062eu062fu0645u064au0646',
        description: 'u0648u0635u0641 u0645u062eu062au0635u0631 u0644u0644u0645u0648u0642u0639'
      },
      {
        key: 'ALLOW_REGISTRATION',
        value: 'true',
        description: 'u0627u0644u0633u0645u0627u062d u0628u062au0633u062cu064au0644 u0645u0633u062au062eu062fu0645u064au0646 u062cu062fu062f'
      },
      {
        key: 'DEFAULT_USER_ROLE',
        value: 'USER',
        description: 'u0627u0644u062fu0648u0631 u0627u0644u0627u0641u062au0631u0627u0636u064a u0644u0644u0645u0633u062au062eu062fu0645u064au0646 u0627u0644u062cu062fu062f'
      },
      {
        key: 'MAINTENANCE_MODE',
        value: 'false',
        description: 'u062au0641u0639u064au0644 u0648u0636u0639 u0627u0644u0635u064au0627u0646u0629'
      }
    ];
    
    // u0625u062fu062eu0627u0644 u0627u0644u0625u0639u062fu0627u062fu0627u062a u0627u0644u0627u0641u062au0631u0627u0636u064au0629
    for (const setting of defaultSettings) {
      // u0627u0644u062au062du0642u0642 u0645u0646 u0648u062cu0648u062f u0627u0644u0625u0639u062fu0627u062f
      const exists = await connection.query(
        `SELECT EXISTS (SELECT 1 FROM system_settings WHERE key = $1)`,
        [setting.key]
      );
      
      if (!exists[0].exists) {
        // u0625u0636u0627u0641u0629 u0627u0644u0625u0639u062fu0627u062f u0625u0630u0627 u0644u0645 u064au0643u0646 u0645u0648u062cu0648u062fu0627u064b
        await connection.query(
          `INSERT INTO system_settings (key, value, description) VALUES ($1, $2, $3)`,
          [setting.key, setting.value, setting.description]
        );
        
        logger.info(`u062au0645 u0625u0646u0634u0627u0621 u0627u0644u0625u0639u062fu0627u062f: ${setting.key}`);
      }
    }
    
    logger.info('u062au0645 u0628u0630u0631 u0627u0644u0625u0639u062fu0627u062fu0627u062a u0628u0646u062cu0627u062d');
  } catch (error) {
    logger.error('u0641u0634u0644 u0641u064a u0628u0630u0631 u0627u0644u0625u0639u062fu0627u062fu0627u062a:', error);
    throw error;
  }
}