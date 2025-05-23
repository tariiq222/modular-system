import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobTitle } from '../entities/job-title.entity';
import { Department } from '../entities/department.entity';
import { Section } from '../entities/section.entity';
import { IncidentType } from '../entities/incident-type.entity';
import { ReportableIncidentType } from '../entities/reportable-incident-type.entity';
import { ContributingFactor } from '../entities/contributing-factor.entity';
import {
  CreateJobTitleDto,
  UpdateJobTitleDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreateSectionDto,
  UpdateSectionDto,
  CreateIncidentTypeDto,
  UpdateIncidentTypeDto,
  CreateReportableIncidentTypeDto,
  UpdateReportableIncidentTypeDto,
  CreateContributingFactorDto,
  UpdateContributingFactorDto,
} from '../dtos/configuration.dto';

@Injectable()
export class ReportConfigurationService {
  constructor(
    @InjectRepository(JobTitle)
    private readonly jobTitleRepository: Repository<JobTitle>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    @InjectRepository(IncidentType)
    private readonly incidentTypeRepository: Repository<IncidentType>,
    @InjectRepository(ReportableIncidentType)
    private readonly reportableIncidentTypeRepository: Repository<ReportableIncidentType>,
    @InjectRepository(ContributingFactor)
    private readonly contributingFactorRepository: Repository<ContributingFactor>,
  ) {}

  // ===== Job Titles =====
  async createJobTitle(createJobTitleDto: CreateJobTitleDto): Promise<JobTitle> {
    const jobTitle = this.jobTitleRepository.create({
      ...createJobTitleDto,
      isActive: createJobTitleDto.isActive ?? true,
      sortOrder: createJobTitleDto.sortOrder ?? 0,
    });
    return this.jobTitleRepository.save(jobTitle);
  }

  async findAllJobTitles(includeInactive = false): Promise<JobTitle[]> {
    const where = includeInactive ? {} : { isActive: true };
    return this.jobTitleRepository.find({
      where,
      order: { sortOrder: 'ASC', nameAr: 'ASC' },
    });
  }

  async findJobTitleById(id: string): Promise<JobTitle> {
    const jobTitle = await this.jobTitleRepository.findOne({ where: { id } });
    if (!jobTitle) {
      throw new NotFoundException('المسمى الوظيفي غير موجود');
    }
    return jobTitle;
  }

  async updateJobTitle(id: string, updateJobTitleDto: UpdateJobTitleDto): Promise<JobTitle> {
    const jobTitle = await this.findJobTitleById(id);
    Object.assign(jobTitle, updateJobTitleDto);
    return this.jobTitleRepository.save(jobTitle);
  }

  async removeJobTitle(id: string): Promise<void> {
    const jobTitle = await this.findJobTitleById(id);
    await this.jobTitleRepository.remove(jobTitle);
  }

  // ===== Departments =====
  async createDepartment(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const department = this.departmentRepository.create({
      ...createDepartmentDto,
      isActive: createDepartmentDto.isActive ?? true,
      sortOrder: createDepartmentDto.sortOrder ?? 0,
    });
    return this.departmentRepository.save(department);
  }

  async findAllDepartments(includeInactive = false): Promise<Department[]> {
    const where = includeInactive ? {} : { isActive: true };
    return this.departmentRepository.find({
      where,
      relations: ['sections'],
      order: { sortOrder: 'ASC', nameAr: 'ASC' },
    });
  }

  async findDepartmentById(id: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['sections'],
    });
    if (!department) {
      throw new NotFoundException('الإدارة غير موجودة');
    }
    return department;
  }

  async updateDepartment(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findDepartmentById(id);
    Object.assign(department, updateDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async removeDepartment(id: string): Promise<void> {
    const department = await this.findDepartmentById(id);
    await this.departmentRepository.remove(department);
  }

  // ===== Sections =====
  async createSection(createSectionDto: CreateSectionDto): Promise<Section> {
    // التحقق من وجود الإدارة
    await this.findDepartmentById(createSectionDto.departmentId);

    const section = this.sectionRepository.create({
      ...createSectionDto,
      isActive: createSectionDto.isActive ?? true,
      sortOrder: createSectionDto.sortOrder ?? 0,
    });
    return this.sectionRepository.save(section);
  }

  async findAllSections(departmentId?: string, includeInactive = false): Promise<Section[]> {
    const where: any = includeInactive ? {} : { isActive: true };
    if (departmentId) {
      where.departmentId = departmentId;
    }

    return this.sectionRepository.find({
      where,
      relations: ['department'],
      order: { sortOrder: 'ASC', nameAr: 'ASC' },
    });
  }

  async findSectionById(id: string): Promise<Section> {
    const section = await this.sectionRepository.findOne({
      where: { id },
      relations: ['department'],
    });
    if (!section) {
      throw new NotFoundException('القسم غير موجود');
    }
    return section;
  }

  async updateSection(id: string, updateSectionDto: UpdateSectionDto): Promise<Section> {
    const section = await this.findSectionById(id);
    
    // التحقق من وجود الإدارة الجديدة إذا تم تغييرها
    if (updateSectionDto.departmentId && updateSectionDto.departmentId !== section.departmentId) {
      await this.findDepartmentById(updateSectionDto.departmentId);
    }

    Object.assign(section, updateSectionDto);
    return this.sectionRepository.save(section);
  }

  async removeSection(id: string): Promise<void> {
    const section = await this.findSectionById(id);
    await this.sectionRepository.remove(section);
  }

  // ===== Incident Types =====
  async createIncidentType(createIncidentTypeDto: CreateIncidentTypeDto): Promise<IncidentType> {
    const incidentType = this.incidentTypeRepository.create({
      ...createIncidentTypeDto,
      isActive: createIncidentTypeDto.isActive ?? true,
      sortOrder: createIncidentTypeDto.sortOrder ?? 0,
    });
    return this.incidentTypeRepository.save(incidentType);
  }

  async findAllIncidentTypes(includeInactive = false): Promise<IncidentType[]> {
    const where = includeInactive ? {} : { isActive: true };
    return this.incidentTypeRepository.find({
      where,
      relations: ['reportableTypes'],
      order: { sortOrder: 'ASC', nameAr: 'ASC' },
    });
  }

  async findIncidentTypeById(id: string): Promise<IncidentType> {
    const incidentType = await this.incidentTypeRepository.findOne({
      where: { id },
      relations: ['reportableTypes'],
    });
    if (!incidentType) {
      throw new NotFoundException('نوع الحادثة غير موجود');
    }
    return incidentType;
  }

  async updateIncidentType(id: string, updateIncidentTypeDto: UpdateIncidentTypeDto): Promise<IncidentType> {
    const incidentType = await this.findIncidentTypeById(id);
    Object.assign(incidentType, updateIncidentTypeDto);
    return this.incidentTypeRepository.save(incidentType);
  }

  async removeIncidentType(id: string): Promise<void> {
    const incidentType = await this.findIncidentTypeById(id);
    await this.incidentTypeRepository.remove(incidentType);
  }

  // ===== Reportable Incident Types =====
  async createReportableIncidentType(createDto: CreateReportableIncidentTypeDto): Promise<ReportableIncidentType> {
    // التحقق من وجود نوع الحادثة الأساسي
    await this.findIncidentTypeById(createDto.incidentTypeId);

    const reportableType = this.reportableIncidentTypeRepository.create({
      ...createDto,
      isActive: createDto.isActive ?? true,
      sortOrder: createDto.sortOrder ?? 0,
    });
    return this.reportableIncidentTypeRepository.save(reportableType);
  }

  async findAllReportableIncidentTypes(incidentTypeId?: string, includeInactive = false): Promise<ReportableIncidentType[]> {
    const where: any = includeInactive ? {} : { isActive: true };
    if (incidentTypeId) {
      where.incidentTypeId = incidentTypeId;
    }

    return this.reportableIncidentTypeRepository.find({
      where,
      relations: ['incidentType'],
      order: { sortOrder: 'ASC', nameAr: 'ASC' },
    });
  }

  async findReportableIncidentTypeById(id: string): Promise<ReportableIncidentType> {
    const reportableType = await this.reportableIncidentTypeRepository.findOne({
      where: { id },
      relations: ['incidentType'],
    });
    if (!reportableType) {
      throw new NotFoundException('نوع الحادثة القابل للإبلاغ غير موجود');
    }
    return reportableType;
  }

  async updateReportableIncidentType(id: string, updateDto: UpdateReportableIncidentTypeDto): Promise<ReportableIncidentType> {
    const reportableType = await this.findReportableIncidentTypeById(id);
    
    // التحقق من وجود نوع الحادثة الأساسي الجديد إذا تم تغييره
    if (updateDto.incidentTypeId && updateDto.incidentTypeId !== reportableType.incidentTypeId) {
      await this.findIncidentTypeById(updateDto.incidentTypeId);
    }

    Object.assign(reportableType, updateDto);
    return this.reportableIncidentTypeRepository.save(reportableType);
  }

  async removeReportableIncidentType(id: string): Promise<void> {
    const reportableType = await this.findReportableIncidentTypeById(id);
    await this.reportableIncidentTypeRepository.remove(reportableType);
  }

  // ===== Contributing Factors =====
  async createContributingFactor(createDto: CreateContributingFactorDto): Promise<ContributingFactor> {
    const factor = this.contributingFactorRepository.create({
      ...createDto,
      isActive: createDto.isActive ?? true,
      sortOrder: createDto.sortOrder ?? 0,
    });
    return this.contributingFactorRepository.save(factor);
  }

  async findAllContributingFactors(includeInactive = false): Promise<ContributingFactor[]> {
    const where = includeInactive ? {} : { isActive: true };
    return this.contributingFactorRepository.find({
      where,
      order: { sortOrder: 'ASC', nameAr: 'ASC' },
    });
  }

  async findContributingFactorById(id: string): Promise<ContributingFactor> {
    const factor = await this.contributingFactorRepository.findOne({ where: { id } });
    if (!factor) {
      throw new NotFoundException('العامل المساهم غير موجود');
    }
    return factor;
  }

  async updateContributingFactor(id: string, updateDto: UpdateContributingFactorDto): Promise<ContributingFactor> {
    const factor = await this.findContributingFactorById(id);
    Object.assign(factor, updateDto);
    return this.contributingFactorRepository.save(factor);
  }

  async removeContributingFactor(id: string): Promise<void> {
    const factor = await this.findContributingFactorById(id);
    await this.contributingFactorRepository.remove(factor);
  }

  // ===== Utility Methods =====
  async getAllConfigurations() {
    const [jobTitles, departments, incidentTypes, contributingFactors] = await Promise.all([
      this.findAllJobTitles(),
      this.findAllDepartments(),
      this.findAllIncidentTypes(),
      this.findAllContributingFactors(),
    ]);

    return {
      jobTitles,
      departments,
      incidentTypes,
      contributingFactors,
    };
  }
}