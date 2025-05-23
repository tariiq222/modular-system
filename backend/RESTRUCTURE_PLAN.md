# خطة إعادة الهيكلة للباك اند

## الهيكل الجديد المقترح:

```
src/
├── main.ts                     # نقطة البداية
├── app.module.ts              # الوحدة الرئيسية
├── config/                    # إعدادات التطبيق
│   ├── database.config.ts
│   ├── cache.config.ts
│   └── index.ts
├── shared/                    # المكونات المشتركة عبر التطبيق
│   ├── decorators/
│   ├── dto/
│   ├── enums/
│   ├── exceptions/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── middlewares/
│   ├── pipes/
│   ├── types/
│   ├── utils/
│   └── shared.module.ts
├── modules/                   # وحدات الأعمال
│   ├── auth/
│   ├── users/
│   ├── profiles/
│   ├── permissions/
│   ├── ovr-reports/
│   ├── mail/
│   ├── settings/
│   └── database/
└── seeds/                     # بيانات البذر
```

## التغييرات المطلوبة:

1. **حذف المجلدات المكررة**: `common/` و `core/`
2. **توحيد المكونات المشتركة** في `shared/`
3. **إعادة تنظيم الاستيرادات**
4. **إنشاء SharedModule موحد**
5. **تحديث المسارات في جميع الملفات**

## الخطوات:

1. إنشاء الهيكل الجديد
2. نقل الملفات وتوحيدها
3. تحديث الاستيرادات
4. اختبار التطبيق