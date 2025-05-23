import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Entities
import { OVRReport } from './entities/ovr-report.entity';
import { JobTitle } from './entities/job-title.entity';
import { Department } from './entities/department.entity';
import { Section } from './entities/section.entity';
import { IncidentType } from './entities/incident-type.entity';
import { ReportableIncidentType } from './entities/reportable-incident-type.entity';
import { ContributingFactor } from './entities/contributing-factor.entity';
import { ReportComment } from './entities/report-comment.entity';
import { ReportStatusHistory } from './entities/report-status-history.entity';

// Services
import { OVRReportService } from './services/ovr-report.service';
import { ReportConfigurationService } from './services/report-configuration.service';
import { ReportTrackingService } from './services/report-tracking.service';
import { ReportNumberGeneratorService } from './services/report-number-generator.service';

// Controllers
import { OVRReportController } from './controllers/ovr-report.controller';
import { ReportTrackingController } from './controllers/report-tracking.controller';
import { ReportConfigurationController } from './controllers/report-configuration.controller';

// Repositories
import { OVRReportRepository } from './repositories/ovr-report.repository';

// External modules
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OVRReport,
      JobTitle,
      Department,
      Section,
      IncidentType,
      ReportableIncidentType,
      ContributingFactor,
      ReportComment,
      ReportStatusHistory,
    ]),
    ConfigModule,
    UsersModule,
    MailModule,
    PermissionsModule,
  ],
  controllers: [
    OVRReportController,
    ReportTrackingController,
    ReportConfigurationController,
  ],
  providers: [
    OVRReportService,
    ReportConfigurationService,
    ReportTrackingService,
    ReportNumberGeneratorService,
    OVRReportRepository,
  ],
  exports: [
    OVRReportService,
    ReportConfigurationService,
    ReportTrackingService,
  ],
})
export class OVRReportsModule {}