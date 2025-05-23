import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '../entities/system-setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private settingsRepository: Repository<SystemSetting>,
  ) {}

  // u062cu0644u0628 u062cu0645u064au0639 u0627u0644u0625u0639u062fu0627u062fu0627u062a u0644u0644u0645u0634u0631u0641u064au0646
  async getAllSettings(): Promise<SystemSetting[]> {
    return this.settingsRepository.find();
  }

  // u062cu0644u0628 u0627u0644u0625u0639u062fu0627u062fu0627u062a u0627u0644u0639u0627u0645u0629 u0641u0642u0637 (u0644u0644u0645u0633u062au062eu062fu0645u064au0646 u0627u0644u0639u0627u062fu064au064au0646)
  async getAllPublicSettings(): Promise<Record<string, string>> {
    const publicSettings = await this.settingsRepository.find({
      where: [
        { key: 'SITE_NAME' },
        { key: 'SITE_DESCRIPTION' },
        { key: 'ALLOW_REGISTRATION' },
        { key: 'MAINTENANCE_MODE' },
      ],
    });

    // u062au062du0648u064au0644u0647u0627 u0625u0644u0649 u0634u0643u0644 u0623u0628u0633u0637 u0644u0644u0627u0633u062au062eu062fu0627u0645 u0641u064a u0627u0644u0648u0627u062cu0647u0629
    const result: Record<string, string> = {};
    publicSettings.forEach((setting) => {
      result[setting.key] = setting.value;
    });

    return result;
  }

  // u062cu0644u0628 u0625u0639u062fu0627u062f u0645u062du062fu062f u0628u0648u0627u0633u0637u0629 u0627u0644u0645u0641u062au0627u062d
  async getSettingByKey(key: string): Promise<SystemSetting> {
    const setting = await this.settingsRepository.findOne({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`u0627u0644u0625u0639u062fu0627u062f u0628u0627u0644u0645u0641u062au0627u062d ${key} u063au064au0631 u0645u0648u062cu0648u062f`);
    }

    return setting;
  }

  // u062au062du062fu064au062b u0625u0639u062fu0627u062f u0645u062du062fu062f
  async updateSetting(key: string, value: string): Promise<SystemSetting> {
    const setting = await this.getSettingByKey(key);
    setting.value = value;
    setting.updatedAt = new Date();
    return this.settingsRepository.save(setting);
  }

  // u062cu0644u0628 u0642u064au0645u0629 u0625u0639u062fu0627u062f u0643u0633u0644u0633u0644u0629 u0646u0635u064au0629
  async getSettingValue(key: string): Promise<string> {
    try {
      const setting = await this.getSettingByKey(key);
      return setting.value;
    } catch (error) {
      return '';
    }
  }

  // u062cu0644u0628 u0642u064au0645u0629 u0625u0639u062fu0627u062f u0643u0642u064au0645u0629 u0645u0646u0637u0642u064au0629
  async getSettingValueAsBoolean(key: string): Promise<boolean> {
    const value = await this.getSettingValue(key);
    return value.toLowerCase() === 'true';
  }
}