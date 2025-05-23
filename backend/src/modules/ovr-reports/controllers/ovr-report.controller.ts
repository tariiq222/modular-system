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
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { OVRReportService } from '../services/ovr-report.service';
import { CreateOVRReportDto } from '../dtos/create-ovr-report.dto';
import { UpdateOVRReportDto, UpdateReportStatusDto, AddCommentDto } from '../dtos/update-ovr-report.dto';
import { ReportFilterDto, ReportSearchDto } from '../dtos/report-filter.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Public } from '../../../shared/decorators/public.decorator';

@ApiTags('ovr-reports')
@Controller('ovr-reports')
export class OVRReportController {
  constructor(private readonly ovrReportService: OVRReportService) {}

  /**
   * إنشاء تقرير جديد (متاح للعامة)
   */
  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'إنشاء تقرير OVR جديد',
    description: 'إنشاء تقرير حادث جديد (متاح للجميع)'
  })
  @ApiBody({ type: CreateOVRReportDto })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء التقرير بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'تم إنشاء التقرير بنجاح' },
        data: {
          type: 'object',
          properties: {
            reportNumber: { type: 'string', example: 'OVR-2025-001' },
            status: { type: 'string', example: 'new' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  async create(@Body() createOvrReportDto: CreateOVRReportDto) {
    const report = await this.ovrReportService.create(createOvrReportDto);
    
    return {
      success: true,
      message: 'تم إنشاء التقرير بنجاح',
      data: {
        reportNumber: report.reportNumber,
        status: report.status,
        createdAt: report.createdAt,
      },
    };
  }

  /**
   * الحصول على جميع التقارير مع الفلترة (للمستخدمين المسجلين فقط)
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'الحصول على جميع التقارير',
    description: 'عرض قائمة التقارير مع إمكانية الفلترة'
  })
  @ApiQuery({ name: 'status', required: false, description: 'فلترة حسب الحالة' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'التاريخ من' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'التاريخ إلى' })
  @ApiQuery({ name: 'page', required: false, description: 'رقم الصفحة' })
  @ApiQuery({ name: 'limit', required: false, description: 'عدد العناصر في الصفحة' })
  @ApiResponse({
    status: 200,
    description: 'قائمة التقارير',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            reports: { type: 'array', items: { type: 'object' } },
            total: { type: 'number' },
            page: { type: 'number' },
            totalPages: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'غير مصرح بالوصول' })
  async findAll(@Query() filterDto: ReportFilterDto) {
    // تحويل التواريخ من string إلى Date
    const filterOptions = {
      ...filterDto,
      dateFrom: filterDto.dateFrom ? new Date(filterDto.dateFrom) : undefined,
      dateTo: filterDto.dateTo ? new Date(filterDto.dateTo) : undefined,
    };
    
    const result = await this.ovrReportService.findAll(filterOptions);
    
    return {
      success: true,
      data: result,
    };
  }

  /**
   * البحث في التقارير (للمستخدمين المسجلين فقط)
   */
  @UseGuards(JwtAuthGuard)
  @Get('search')
  async search(@Query() searchDto: ReportSearchDto) {
    if (!searchDto.searchTerm) {
      return this.findAll(searchDto);
    }

    // تحويل التواريخ من string إلى Date
    const searchOptions = {
      ...searchDto,
      dateFrom: searchDto.dateFrom ? new Date(searchDto.dateFrom) : undefined,
      dateTo: searchDto.dateTo ? new Date(searchDto.dateTo) : undefined,
    };

    const result = await this.ovrReportService.search(searchDto.searchTerm, searchOptions);
    
    return {
      success: true,
      data: result,
    };
  }

  /**
   * الحصول على إحصائيات التقارير (للمستخدمين المسجلين فقط)
   */
  @UseGuards(JwtAuthGuard)
  @Get('statistics')
  async getStatistics() {
    const statistics = await this.ovrReportService.getStatistics();
    
    return {
      success: true,
      data: statistics,
    };
  }

  /**
   * الحصول على تقرير واحد (للمستخدمين المسجلين فقط)
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const report = await this.ovrReportService.findOne(id);
    
    return {
      success: true,
      data: report,
    };
  }

  /**
   * تحديث التقرير (للمستخدمين المسجلين فقط)
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOvrReportDto: UpdateOVRReportDto,
    @Req() request: Request,
  ) {
    const userId = (request.user as any)?.id;
    const report = await this.ovrReportService.update(id, updateOvrReportDto, userId);
    
    return {
      success: true,
      message: 'تم تحديث التقرير بنجاح',
      data: report,
    };
  }

  /**
   * تغيير حالة التقرير (للمستخدمين المسجلين فقط)
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateReportStatusDto,
    @Req() request: Request,
  ) {
    const userId = (request.user as any)?.id;
    const report = await this.ovrReportService.updateStatus(id, updateStatusDto, userId);
    
    return {
      success: true,
      message: 'تم تحديث حالة التقرير بنجاح',
      data: report,
    };
  }

  /**
   * إضافة تعليق على التقرير (للمستخدمين المسجلين فقط)
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async addComment(
    @Param('id') id: string,
    @Body() addCommentDto: AddCommentDto,
    @Req() request: Request,
  ) {
    const userId = (request.user as any)?.id;
    const comment = await this.ovrReportService.addComment(id, addCommentDto, userId);
    
    return {
      success: true,
      message: 'تم إضافة التعليق بنجاح',
      data: comment,
    };
  }

  /**
   * حذف التقرير (للمستخدمين المسجلين فقط)
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.ovrReportService.remove(id);
    
    return {
      success: true,
      message: 'تم حذف التقرير بنجاح',
    };
  }
}