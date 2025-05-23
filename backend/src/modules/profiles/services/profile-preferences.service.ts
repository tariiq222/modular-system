import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfilePreference, PreferenceCategory } from '../entities/profile-preference.entity';
import { ProfilePreferenceDto } from '../dtos/profile-preference.dto';
import { ProfileService } from './profile.service';

@Injectable()
export class ProfilePreferencesService {
  constructor(
    @InjectRepository(ProfilePreference)
    private readonly preferenceRepository: Repository<ProfilePreference>,
    private readonly profileService: ProfileService,
  ) {}

  /**
   * u0625u0646u0634u0627u0621 u062au0641u0636u064au0644 u062cu062fu064au062f
   */
  async create(profileId: string, preferenceDto: ProfilePreferenceDto): Promise<ProfilePreference> {
    // u0627u0644u062au062du0642u0642 u0645u0646 u0648u062cu0648u062f u0627u0644u0645u0644u0641 u0627u0644u0634u062eu0635u064a
    await this.profileService.findOne(profileId);

    // u0627u0644u062au062du0642u0642 u0645u0646 u0639u062fu0645 u0648u062cu0648u062f u0627u0644u062au0641u0636u064au0644 u0628u0646u0641u0633 u0627u0644u0645u0641u062au0627u062d
    const existingPreference = await this.preferenceRepository.findOne({
      where: {
        profileId,
        category: preferenceDto.category,
        key: preferenceDto.key,
      },
    });

    if (existingPreference) {
      // u062au062du062fu064au062b u0627u0644u062au0641u0636u064au0644 u0627u0644u0645u0648u062cu0648u062f
      existingPreference.value = preferenceDto.value;
      return this.preferenceRepository.save(existingPreference);
    }

    // u0625u0646u0634u0627u0621 u062au0641u0636u064au0644 u062cu062fu064au062f
    const newPreference = this.preferenceRepository.create({
      profileId,
      ...preferenceDto,
    });

    return this.preferenceRepository.save(newPreference);
  }

  /**
   * u0627u0644u062du0635u0648u0644 u0639u0644u0649 u062cu0645u064au0639 u062au0641u0636u064au0644u0627u062a u0645u0644u0641 u0634u062eu0635u064a
   */
  async findAllByProfileId(profileId: string): Promise<ProfilePreference[]> {
    return this.preferenceRepository.find({
      where: { profileId },
      order: { category: 'ASC', key: 'ASC' },
    });
  }

  /**
   * u0627u0644u062du0635u0648u0644 u0639u0644u0649 u062au0641u0636u064au0644u0627u062a u0628u0641u0626u0629 u0645u062du062fu062fu0629
   */
  async findByCategory(profileId: string, category: PreferenceCategory): Promise<ProfilePreference[]> {
    return this.preferenceRepository.find({
      where: { profileId, category },
      order: { key: 'ASC' },
    });
  }

  /**
   * u0627u0644u062du0635u0648u0644 u0639u0644u0649 u062au0641u0636u064au0644 u0645u062du062fu062f
   */
  async findByKey(profileId: string, category: PreferenceCategory, key: string): Promise<ProfilePreference> {
    const preference = await this.preferenceRepository.findOne({
      where: { profileId, category, key },
    });

    if (!preference) {
      throw new NotFoundException(`u0627u0644u062au0641u0636u064au0644 ${key} u063au064au0631 u0645u0648u062cu0648u062f u0641u064a u0627u0644u0641u0626u0629 ${category}`);
    }

    return preference;
  }

  /**
   * u062au062du062fu064au062b u062au0641u0636u064au0644
   */
  async update(id: string, value: string): Promise<ProfilePreference> {
    const preference = await this.preferenceRepository.findOne({ where: { id } });

    if (!preference) {
      throw new NotFoundException('u0627u0644u062au0641u0636u064au0644 u063au064au0631 u0645u0648u062cu0648u062f');
    }

    preference.value = value;
    return this.preferenceRepository.save(preference);
  }

  /**
   * u062du0630u0641 u062au0641u0636u064au0644
   */
  async remove(id: string): Promise<boolean> {
    const preference = await this.preferenceRepository.findOne({ where: { id } });

    if (!preference) {
      throw new NotFoundException('u0627u0644u062au0641u0636u064au0644 u063au064au0631 u0645u0648u062cu0648u062f');
    }

    const result = await this.preferenceRepository.remove(preference);
    return !!result;
  }

  /**
   * u0625u0646u0634u0627u0621 u0623u0648 u062au062du062fu064au062b u062au0641u0636u064au0644u0627u062a u0645u062au0639u062fu062fu0629
   */
  async createOrUpdateBulk(profileId: string, preferences: ProfilePreferenceDto[]): Promise<ProfilePreference[]> {
    const results = [];
    
    for (const preference of preferences) {
      const result = await this.create(profileId, preference);
      results.push(result);
    }
    
    return results;
  }
}