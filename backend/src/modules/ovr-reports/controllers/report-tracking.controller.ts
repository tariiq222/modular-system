import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ReportTrackingService } from '../services/report-tracking.service';
import { ReportTrackingDto } from '../dtos/report-filter.dto';
import { Public } from '../../../shared/decorators/public.decorator';

@Controller('ovr-reports/track')
export class ReportTrackingController {
  constructor(private readonly reportTrackingService: ReportTrackingService) {}

  /**
   * تتبع التقرير برقم التقرير (متاح للعامة)
   */
  @Public()
  @Get(':reportNumber')
  async trackReport(@Param('reportNumber') reportNumber: string) {
    // التحقق من صحة رقم التقرير
    if (!this.reportTrackingService.validateReportNumber(reportNumber)) {
      throw new BadRequestException('رقم التقرير غير صحيح. يجب أن يكون بالصيغة: OVR-YYYY_XXXX');
    }

    const trackingInfo = await this.reportTrackingService.trackReport(reportNumber);
    
    return {
      success: true,
      data: trackingInfo,
    };
  }

  /**
   * التحقق من وجود التقرير (متاح للعامة)
   */
  @Public()
  @Get(':reportNumber/exists')
  async checkReportExists(@Param('reportNumber') reportNumber: string) {
    // التحقق من صحة رقم التقرير
    if (!this.reportTrackingService.validateReportNumber(reportNumber)) {
      throw new BadRequestException('رقم التقرير غير صحيح. يجب أن يكون بالصيغة: OVR-YYYY_XXXX');
    }

    const basicInfo = await this.reportTrackingService.getReportBasicInfo(reportNumber);
    
    return {
      success: true,
      data: basicInfo,
    };
  }

  /**
   * البحث العام في التقارير (متاح للعامة - محدود)
   */
  @Public()
  @Get('search/public')
  async searchPublicReports(
    @Query('reporterName') reporterName?: string,
    @Query('incidentDate') incidentDate?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    const criteria: any = {};

    if (reporterName) {
      criteria.reporterName = reporterName;
    }

    if (incidentDate) {
      try {
        criteria.incidentDate = new Date(incidentDate);
      } catch (error) {
        throw new BadRequestException('تاريخ الحادثة غير صحيح');
      }
    }

    if (departmentId) {
      criteria.departmentId = departmentId;
    }

    // التأكد من وجود معيار واحد على الأقل
    if (Object.keys(criteria).length === 0) {
      throw new BadRequestException('يجب تحديد معيار بحث واحد على الأقل');
    }

    const reports = await this.reportTrackingService.searchPublicReports(criteria);
    
    return {
      success: true,
      data: reports,
    };
  }

  /**
   * الحصول على إحصائيات عامة (متاح للعامة)
   */
  @Public()
  @Get('statistics/public')
  async getPublicStatistics() {
    const statistics = await this.reportTrackingService.getPublicStatistics();
    
    return {
      success: true,
      data: statistics,
    };
  }
}