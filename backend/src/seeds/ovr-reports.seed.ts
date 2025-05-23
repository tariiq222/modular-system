import { DataSource } from 'typeorm';
import { JobTitle } from '../modules/ovr-reports/entities/job-title.entity';
import { Department } from '../modules/ovr-reports/entities/department.entity';
import { Section } from '../modules/ovr-reports/entities/section.entity';
import { IncidentType } from '../modules/ovr-reports/entities/incident-type.entity';
import { ReportableIncidentType } from '../modules/ovr-reports/entities/reportable-incident-type.entity';
import { ContributingFactor } from '../modules/ovr-reports/entities/contributing-factor.entity';

export const seedOVRReportsData = async (dataSource: DataSource): Promise<void> => {
  console.log('بدء زراعة بيانات تقارير الحوادث...');

  // المسميات الوظيفية
  const jobTitles = [
    {
      nameAr: 'طبيب',
      nameEn: 'Doctor',
      description: 'طبيب في المستشفى',
      isActive: true,
      sortOrder: 1,
    },
    {
      nameAr: 'ممرض',
      nameEn: 'Nurse',
      description: 'ممرض في المستشفى',
      isActive: true,
      sortOrder: 2,
    },
    {
      nameAr: 'فني',
      nameEn: 'Technician',
      description: 'فني في المستشفى',
      isActive: true,
      sortOrder: 3,
    },
    {
      nameAr: 'إداري',
      nameEn: 'Administrator',
      description: 'إداري في المستشفى',
      isActive: true,
      sortOrder: 4,
    },
    {
      nameAr: 'موظف استقبال',
      nameEn: 'Receptionist',
      description: 'موظف استقبال في المستشفى',
      isActive: true,
      sortOrder: 5,
    },
  ];

  // الإدارات
  const departments = [
    {
      nameAr: 'الطوارئ',
      nameEn: 'Emergency',
      description: 'قسم الطوارئ',
      isActive: true,
      sortOrder: 1,
    },
    {
      nameAr: 'العيادات الخارجية',
      nameEn: 'Outpatient Clinics',
      description: 'قسم العيادات الخارجية',
      isActive: true,
      sortOrder: 2,
    },
    {
      nameAr: 'التنويم',
      nameEn: 'Inpatient',
      description: 'قسم التنويم',
      isActive: true,
      sortOrder: 3,
    },
    {
      nameAr: 'المختبر',
      nameEn: 'Laboratory',
      description: 'قسم المختبر',
      isActive: true,
      sortOrder: 4,
    },
    {
      nameAr: 'الأشعة',
      nameEn: 'Radiology',
      description: 'قسم الأشعة',
      isActive: true,
      sortOrder: 5,
    },
  ];

  // الأقسام
  const sections = [
    {
      nameAr: 'طوارئ البالغين',
      nameEn: 'Adult Emergency',
      description: 'قسم طوارئ البالغين',
      departmentId: '', // سيتم تعبئته لاحقاً
      isActive: true,
      sortOrder: 1,
    },
    {
      nameAr: 'طوارئ الأطفال',
      nameEn: 'Pediatric Emergency',
      description: 'قسم طوارئ الأطفال',
      departmentId: '', // سيتم تعبئته لاحقاً
      isActive: true,
      sortOrder: 2,
    },
    {
      nameAr: 'عيادة الباطنية',
      nameEn: 'Internal Medicine Clinic',
      description: 'عيادة الباطنية',
      departmentId: '', // سيتم تعبئته لاحقاً
      isActive: true,
      sortOrder: 1,
    },
    {
      nameAr: 'عيادة الجراحة',
      nameEn: 'Surgery Clinic',
      description: 'عيادة الجراحة',
      departmentId: '', // سيتم تعبئته لاحقاً
      isActive: true,
      sortOrder: 2,
    },
  ];

  // أنواع الحوادث
  const incidentTypes = [
    {
      nameAr: 'حادثة سلامة المرضى',
      nameEn: 'Patient Safety Incident',
      description: 'حادثة متعلقة بسلامة المرضى',
      isActive: true,
      sortOrder: 1,
    },
    {
      nameAr: 'حادثة سلامة الموظفين',
      nameEn: 'Staff Safety Incident',
      description: 'حادثة متعلقة بسلامة الموظفين',
      isActive: true,
      sortOrder: 2,
    },
    {
      nameAr: 'حادثة أمن المعلومات',
      nameEn: 'Information Security Incident',
      description: 'حادثة متعلقة بأمن المعلومات',
      isActive: true,
      sortOrder: 3,
    },
    {
      nameAr: 'حادثة بيئية',
      nameEn: 'Environmental Incident',
      description: 'حادثة متعلقة بالبيئة',
      isActive: true,
      sortOrder: 4,
    },
    {
      nameAr: 'حادثة أمن وسلامة',
      nameEn: 'Security and Safety Incident',
      description: 'حادثة متعلقة بالأمن والسلامة',
      isActive: true,
      sortOrder: 5,
    },
  ];

  // أنواع الحوادث القابلة للإبلاغ
  const reportableIncidentTypes = [
    {
      nameAr: 'سقوط المريض',
      nameEn: 'Patient Fall',
      description: 'سقوط المريض أثناء تلقي الرعاية',
      incidentTypeId: '', // سيتم تعبئته لاحقاً
      isActive: true,
      sortOrder: 1,
    },
    {
      nameAr: 'خطأ دوائي',
      nameEn: 'Medication Error',
      description: 'خطأ في وصف أو إعطاء الدواء',
      incidentTypeId: '', // سيتم تعبئته لاحقاً
      isActive: true,
      sortOrder: 2,
    },
    {
      nameAr: 'إصابة عمل',
      nameEn: 'Work Injury',
      description: 'إصابة أثناء العمل',
      incidentTypeId: '', // سيتم تعبئته لاحقاً
      isActive: true,
      sortOrder: 1,
    },
    {
      nameAr: 'تسرب بيانات',
      nameEn: 'Data Breach',
      description: 'تسرب بيانات المرضى أو الموظفين',
      incidentTypeId: '', // سيتم تعبئته لاحقاً
      isActive: true,
      sortOrder: 1,
    },
  ];

  // العوامل المساهمة
  const contributingFactors = [
    {
      nameAr: 'نقص التدريب',
      nameEn: 'Lack of Training',
      description: 'نقص في التدريب أو المعرفة',
      isActive: true,
      sortOrder: 1,
    },
    {
      nameAr: 'ضغط العمل',
      nameEn: 'Work Pressure',
      description: 'ضغط العمل وزيادة الأعباء',
      isActive: true,
      sortOrder: 2,
    },
    {
      nameAr: 'نقص الموارد',
      nameEn: 'Lack of Resources',
      description: 'نقص في الموارد اللازمة',
      isActive: true,
      sortOrder: 3,
    },
    {
      nameAr: 'خلل في التواصل',
      nameEn: 'Communication Failure',
      description: 'خلل في التواصل بين الفريق',
      isActive: true,
      sortOrder: 4,
    },
    {
      nameAr: 'خلل في الإجراءات',
      nameEn: 'Procedure Failure',
      description: 'خلل في الإجراءات أو عدم وجودها',
      isActive: true,
      sortOrder: 5,
    },
    {
      nameAr: 'عوامل بيئية',
      nameEn: 'Environmental Factors',
      description: 'عوامل متعلقة بالبيئة المحيطة',
      isActive: true,
      sortOrder: 6,
    },
  ];

  try {
    // حفظ المسميات الوظيفية
    const jobTitleRepository = dataSource.getRepository(JobTitle);
    const existingJobTitles = await jobTitleRepository.find();
    
    if (existingJobTitles.length === 0) {
      const jobTitleEntities = jobTitleRepository.create(jobTitles);
      await jobTitleRepository.save(jobTitleEntities);
      console.log(`تم إنشاء ${jobTitles.length} مسمى وظيفي`);
    } else {
      console.log('المسميات الوظيفية موجودة بالفعل، تخطي...');
    }

    // حفظ الإدارات
    const departmentRepository = dataSource.getRepository(Department);
    const existingDepartments = await departmentRepository.find();
    
    if (existingDepartments.length === 0) {
      const departmentEntities = departmentRepository.create(departments);
      const savedDepartments = await departmentRepository.save(departmentEntities);
      console.log(`تم إنشاء ${departments.length} إدارة`);

      // ربط الأقسام بالإدارات
      const emergencyDept = savedDepartments.find(d => d.nameEn === 'Emergency');
      const outpatientDept = savedDepartments.find(d => d.nameEn === 'Outpatient Clinics');

      if (emergencyDept) {
        sections[0].departmentId = emergencyDept.id;
        sections[1].departmentId = emergencyDept.id;
      }

      if (outpatientDept) {
        sections[2].departmentId = outpatientDept.id;
        sections[3].departmentId = outpatientDept.id;
      }

      // حفظ الأقسام
      const sectionRepository = dataSource.getRepository(Section);
      const existingSections = await sectionRepository.find();
      
      if (existingSections.length === 0) {
        const sectionEntities = sectionRepository.create(sections);
        await sectionRepository.save(sectionEntities);
        console.log(`تم إنشاء ${sections.length} قسم`);
      } else {
        console.log('الأقسام موجودة بالفعل، تخطي...');
      }
    } else {
      console.log('الإدارات موجودة بالفعل، تخطي...');
    }

    // حفظ أنواع الحوادث
    const incidentTypeRepository = dataSource.getRepository(IncidentType);
    const existingIncidentTypes = await incidentTypeRepository.find();
    
    if (existingIncidentTypes.length === 0) {
      const incidentTypeEntities = incidentTypeRepository.create(incidentTypes);
      const savedIncidentTypes = await incidentTypeRepository.save(incidentTypeEntities);
      console.log(`تم إنشاء ${incidentTypes.length} نوع حادثة`);

      // ربط أنواع الحوادث القابلة للإبلاغ بأنواع الحوادث
      const patientSafetyType = savedIncidentTypes.find(t => t.nameEn === 'Patient Safety Incident');
      const staffSafetyType = savedIncidentTypes.find(t => t.nameEn === 'Staff Safety Incident');
      const infoSecurityType = savedIncidentTypes.find(t => t.nameEn === 'Information Security Incident');

      if (patientSafetyType) {
        reportableIncidentTypes[0].incidentTypeId = patientSafetyType.id;
        reportableIncidentTypes[1].incidentTypeId = patientSafetyType.id;
      }

      if (staffSafetyType) {
        reportableIncidentTypes[2].incidentTypeId = staffSafetyType.id;
      }

      if (infoSecurityType) {
        reportableIncidentTypes[3].incidentTypeId = infoSecurityType.id;
      }

      // حفظ أنواع الحوادث القابلة للإبلاغ
      const reportableTypeRepository = dataSource.getRepository(ReportableIncidentType);
      const existingReportableTypes = await reportableTypeRepository.find();
      
      if (existingReportableTypes.length === 0) {
        const reportableTypeEntities = reportableTypeRepository.create(reportableIncidentTypes);
        await reportableTypeRepository.save(reportableTypeEntities);
        console.log(`تم إنشاء ${reportableIncidentTypes.length} نوع حادثة قابل للإبلاغ`);
      } else {
        console.log('أنواع الحوادث القابلة للإبلاغ موجودة بالفعل، تخطي...');
      }
    } else {
      console.log('أنواع الحوادث موجودة بالفعل، تخطي...');
    }

    // حفظ العوامل المساهمة
    const contributingFactorRepository = dataSource.getRepository(ContributingFactor);
    const existingFactors = await contributingFactorRepository.find();
    
    if (existingFactors.length === 0) {
      const factorEntities = contributingFactorRepository.create(contributingFactors);
      await contributingFactorRepository.save(factorEntities);
      console.log(`تم إنشاء ${contributingFactors.length} عامل مساهم`);
    } else {
      console.log('العوامل المساهمة موجودة بالفعل، تخطي...');
    }

    console.log('تم الانتهاء من زراعة بيانات تقارير الحوادث بنجاح');
  } catch (error) {
    console.error('حدث خطأ أثناء زراعة بيانات تقارير الحوادث:', error);
    throw error;
  }
};