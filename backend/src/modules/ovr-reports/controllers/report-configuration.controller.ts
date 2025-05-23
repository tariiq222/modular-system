import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ReportConfigurationService } from '../services/report-configuration.service';
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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Public } from '../../../shared/decorators/public.decorator';

@ApiTags('الإعدادات والتهيئة')
@Controller('ovr-reports/config')
export class ReportConfigurationController {
  constructor(private readonly configService: ReportConfigurationService) {}

  /**
   * الحصول على جميع الإعدادات (متاح للعامة للقوائم المنسدلة)
   */
  @Public()
  @Get('all')
  @ApiOperation({ summary: 'u0627u0644u062du0635u0648u0644 u0639u0644u0649 u062cu0645u064au0639 u0627u0644u0625u0639u062fu0627u062fu0627u062a u0644u0644u0642u0648u0627u0626u0645 u0627u0644u0645u0646u0633u062fu0644u0629' })
  @ApiResponse({ status: 200, description: 'u062au0645 u0627u0633u062au0631u062cu0627u0639 u0627u0644u0625u0639u062fu0627u062fu0627u062a u0628u0646u062cu0627u062d' })
  async getAllConfigurations() {
    const configurations = await this.configService.getAllConfigurations();
    
    return {
      success: true,
      data: configurations,
    };
  }

  // ===== Job Titles =====
  @Public()
  @Get('job-titles')
  @ApiOperation({ summary: 'u0627u0644u062du0635u0648u0644 u0639u0644u0649 u062cu0645u064au0639 u0627u0644u0645u0633u0645u064au0627u062a u0627u0644u0648u0638u064au0641u064au0629' })
  @ApiResponse({ status: 200, description: 'u062au0645 u0627u0633u062au0631u062cu0627u0639 u0627u0644u0645u0633u0645u064au0627u062a u0627u0644u0648u0638u064au0641u064au0629 u0628u0646u062cu0627u062d' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'u062au0636u0645u064au0646 u0627u0644u0639u0646u0627u0635u0631 u063au064au0631 u0627u0644u0646u0634u0637u0629 u0641u064a u0627u0644u0646u062au0627u0626u062c' })
  async getAllJobTitles(@Query('includeInactive') includeInactive?: string) {
    const jobTitles = await this.configService.findAllJobTitles(includeInactive === 'true');
    
    return {
      success: true,
      data: jobTitles,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('job-titles')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'u0625u0646u0634u0627u0621 u0645u0633u0645u0649 u0648u0638u064au0641u064a u062cu062fu064au062f' })
  @ApiResponse({ status: 201, description: 'u062au0645 u0625u0646u0634u0627u0621 u0627u0644u0645u0633u0645u0649 u0627u0644u0648u0638u064au0641u064a u0628u0646u062cu0627u062d' })
  async createJobTitle(@Body() createJobTitleDto: CreateJobTitleDto) {
    const jobTitle = await this.configService.createJobTitle(createJobTitleDto);
    
    return {
      success: true,
      message: 'تم إنشاء المسمى الوظيفي بنجاح',
      data: jobTitle,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('job-titles/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0645u0633u0645u0649 u0648u0638u064au0641u064a u0645u062du062fu062f' })
  @ApiResponse({ status: 200, description: 'u062au0645 u0627u0633u062au0631u062cu0627u0639 u0627u0644u0645u0633u0645u0649 u0627u0644u0648u0638u064au0641u064a u0628u0646u062cu0627u062d' })
  @ApiResponse({ status: 404, description: 'u0627u0644u0645u0633u0645u0649 u0627u0644u0648u0638u064au0641u064a u063au064au0631 u0645u0648u062cu0648u062f' })
  @ApiParam({ name: 'id', description: 'u0645u0639u0631u0641 u0627u0644u0645u0633u0645u0649 u0627u0644u0648u0638u064au0641u064a' })
  async getJobTitle(@Param('id') id: string) {
    const jobTitle = await this.configService.findJobTitleById(id);
    
    return {
      success: true,
      data: jobTitle,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('job-titles/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'u062au062du062fu064au062b u0645u0633u0645u0649 u0648u0638u064au0641u064a' })
  @ApiResponse({ status: 200, description: 'u062au0645 u062au062du062fu064au062b u0627u0644u0645u0633u0645u0649 u0627u0644u0648u0638u064au0641u064a u0628u0646u062cu0627u062d' })
  @ApiResponse({ status: 404, description: 'u0627u0644u0645u0633u0645u0649 u0627u0644u0648u0638u064au0641u064a u063au064au0631 u0645u0648u062cu0648u062f' })
  @ApiParam({ name: 'id', description: 'u0645u0639u0631u0641 u0627u0644u0645u0633u0645u0649 u0627u0644u0648u0638u064au0641u064a' })
  async updateJobTitle(@Param('id') id: string, @Body() updateJobTitleDto: UpdateJobTitleDto) {
    const jobTitle = await this.configService.updateJobTitle(id, updateJobTitleDto);
    
    return {
      success: true,
      message: 'تم تحديث المسمى الوظيفي بنجاح',
      data: jobTitle,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('job-titles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'u062du0630u0641 u0645u0633u0645u0649 u0648u0638u064au0641u064a' })
  @ApiResponse({ status: 204, description: 'u062au0645 u062du0630u0641 u0627u0644u0645u0633u0645u0649 u0627u0644u0648u0638u064au0641u064a u0628u0646u062cu0627u062d' })
  @ApiResponse({ status: 404, description: 'u0627u0644u0645u0633u0645u0649 u0627u0644u0648u0638u064au0641u064a u063au064au0631 u0645u0648u062cu0648u062f' })
  @ApiParam({ name: 'id', description: 'u0645u0639u0631u0641 u0627u0644u0645u0633u0645u0649 u0627u0644u0648u0638u064au0641u064a' })
  async removeJobTitle(@Param('id') id: string) {
    await this.configService.removeJobTitle(id);
    
    return {
      success: true,
      message: 'تم حذف المسمى الوظيفي بنجاح',
    };
  }

  // ===== Departments =====
  @Public()
  @Get('departments')
  @ApiOperation({ summary: 'u0627u0644u062du0635u0648u0644 u0639u0644u0649 u062cu0645u064au0639 u0627u0644u0625u062fu0627u0631u0627u062a' })
  @ApiResponse({ status: 200, description: 'u062au0645 u0627u0633u062au0631u062cu0627u0639 u0627u0644u0625u062fu0627u0631u0627u062a u0628u0646u062cu0627u062d' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'u062au0636u0645u064au0646 u0627u0644u0639u0646u0627u0635u0631 u063au064au0631 u0627u0644u0646u0634u0637u0629 u0641u064a u0627u0644u0646u062au0627u0626u062c' })
  async getAllDepartments(@Query('includeInactive') includeInactive?: string) {
    const departments = await this.configService.findAllDepartments(includeInactive === 'true');
    
    return {
      success: true,
      data: departments,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('departments')
  async createDepartment(@Body() createDepartmentDto: CreateDepartmentDto) {
    const department = await this.configService.createDepartment(createDepartmentDto);
    
    return {
      success: true,
      message: 'تم إنشاء الإدارة بنجاح',
      data: department,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('departments/:id')
  async getDepartment(@Param('id') id: string) {
    const department = await this.configService.findDepartmentById(id);
    
    return {
      success: true,
      data: department,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('departments/:id')
  async updateDepartment(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.configService.updateDepartment(id, updateDepartmentDto);
    
    return {
      success: true,
      message: 'تم تحديث الإدارة بنجاح',
      data: department,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('departments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeDepartment(@Param('id') id: string) {
    await this.configService.removeDepartment(id);
    
    return {
      success: true,
      message: 'تم حذف الإدارة بنجاح',
    };
  }

  // ===== Sections =====
  @Public()
  @Get('sections')
  async getAllSections(
    @Query('departmentId') departmentId?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const sections = await this.configService.findAllSections(
      departmentId,
      includeInactive === 'true',
    );
    
    return {
      success: true,
      data: sections,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('sections')
  async createSection(@Body() createSectionDto: CreateSectionDto) {
    const section = await this.configService.createSection(createSectionDto);
    
    return {
      success: true,
      message: 'تم إنشاء القسم بنجاح',
      data: section,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('sections/:id')
  async getSection(@Param('id') id: string) {
    const section = await this.configService.findSectionById(id);
    
    return {
      success: true,
      data: section,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('sections/:id')
  async updateSection(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
    const section = await this.configService.updateSection(id, updateSectionDto);
    
    return {
      success: true,
      message: 'تم تحديث القسم بنجاح',
      data: section,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sections/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeSection(@Param('id') id: string) {
    await this.configService.removeSection(id);
    
    return {
      success: true,
      message: 'تم حذف القسم بنجاح',
    };
  }

  // ===== Incident Types =====
  @Public()
  @Get('incident-types')
  async getAllIncidentTypes(@Query('includeInactive') includeInactive?: string) {
    const incidentTypes = await this.configService.findAllIncidentTypes(includeInactive === 'true');
    
    return {
      success: true,
      data: incidentTypes,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('incident-types')
  async createIncidentType(@Body() createIncidentTypeDto: CreateIncidentTypeDto) {
    const incidentType = await this.configService.createIncidentType(createIncidentTypeDto);
    
    return {
      success: true,
      message: 'تم إنشاء نوع الحادثة بنجاح',
      data: incidentType,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('incident-types/:id')
  async getIncidentType(@Param('id') id: string) {
    const incidentType = await this.configService.findIncidentTypeById(id);
    
    return {
      success: true,
      data: incidentType,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('incident-types/:id')
  async updateIncidentType(@Param('id') id: string, @Body() updateIncidentTypeDto: UpdateIncidentTypeDto) {
    const incidentType = await this.configService.updateIncidentType(id, updateIncidentTypeDto);
    
    return {
      success: true,
      message: 'تم تحديث نوع الحادثة بنجاح',
      data: incidentType,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('incident-types/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeIncidentType(@Param('id') id: string) {
    await this.configService.removeIncidentType(id);
    
    return {
      success: true,
      message: 'تم حذف نوع الحادثة بنجاح',
    };
  }

  // ===== Reportable Incident Types =====
  @Public()
  @Get('reportable-incident-types')
  async getAllReportableIncidentTypes(
    @Query('incidentTypeId') incidentTypeId?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const reportableTypes = await this.configService.findAllReportableIncidentTypes(
      incidentTypeId,
      includeInactive === 'true',
    );
    
    return {
      success: true,
      data: reportableTypes,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reportable-incident-types')
  async createReportableIncidentType(@Body() createDto: CreateReportableIncidentTypeDto) {
    const reportableType = await this.configService.createReportableIncidentType(createDto);
    
    return {
      success: true,
      message: 'تم إنشاء نوع الحادثة القابل للإبلاغ بنجاح',
      data: reportableType,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('reportable-incident-types/:id')
  async getReportableIncidentType(@Param('id') id: string) {
    const reportableType = await this.configService.findReportableIncidentTypeById(id);
    
    return {
      success: true,
      data: reportableType,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('reportable-incident-types/:id')
  async updateReportableIncidentType(@Param('id') id: string, @Body() updateDto: UpdateReportableIncidentTypeDto) {
    const reportableType = await this.configService.updateReportableIncidentType(id, updateDto);
    
    return {
      success: true,
      message: 'تم تحديث نوع الحادثة القابل للإبلاغ بنجاح',
      data: reportableType,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('reportable-incident-types/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeReportableIncidentType(@Param('id') id: string) {
    await this.configService.removeReportableIncidentType(id);
    
    return {
      success: true,
      message: 'تم حذف نوع الحادثة القابل للإبلاغ بنجاح',
    };
  }

  // ===== Contributing Factors =====
  @Public()
  @Get('contributing-factors')
  async getAllContributingFactors(@Query('includeInactive') includeInactive?: string) {
    const factors = await this.configService.findAllContributingFactors(includeInactive === 'true');
    
    return {
      success: true,
      data: factors,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('contributing-factors')
  async createContributingFactor(@Body() createDto: CreateContributingFactorDto) {
    const factor = await this.configService.createContributingFactor(createDto);
    
    return {
      success: true,
      message: 'تم إنشاء العامل المساهم بنجاح',
      data: factor,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('contributing-factors/:id')
  async getContributingFactor(@Param('id') id: string) {
    const factor = await this.configService.findContributingFactorById(id);
    
    return {
      success: true,
      data: factor,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('contributing-factors/:id')
  async updateContributingFactor(@Param('id') id: string, @Body() updateDto: UpdateContributingFactorDto) {
    const factor = await this.configService.updateContributingFactor(id, updateDto);
    
    return {
      success: true,
      message: 'تم تحديث العامل المساهم بنجاح',
      data: factor,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('contributing-factors/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeContributingFactor(@Param('id') id: string) {
    await this.configService.removeContributingFactor(id);
    
    return {
      success: true,
      message: 'تم حذف العامل المساهم بنجاح',
    };
  }
}