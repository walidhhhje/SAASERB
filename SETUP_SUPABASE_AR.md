# تعليمات تطبيق قاعدة البيانات على Supabase

## الخطوة 1: الدخول إلى Supabase Dashboard

1. اذهب إلى: https://supabase.com
2. سجل دخولك
3. اختر المشروع: `xrbfyrhxygpenmojazde`

## الخطوة 2: فتح SQL Editor

1.  في الجانب الأيسر، انقر على **SQL Editor**
2. انقر على **+ New Query**

## الخطوة 3: تنفيذ الـ Migration

1. افتح الملف: `apps/backend/supabase/migrations/002_complete_schema.sql`
2. انسخ كل محتوى الملف
3. الصقه في Supabase SQL Editor
4. انقر على زر **Run** أو اضغط `Ctrl+Enter`

## الخطوة 4: تحقق من نجاح العملية

بعد التنفيذ الناجح، يجب أن تظهر الرسائل:
- ✅ All tables created
- ✅ All indexes created  
- ✅ All RLS policies enabled
- ✅ Demo data seeded

## الخطوة 5: اختبر الاتصال

من Terminal، شغّل:

```bash
npm run dev
```

ثم افتح:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001/health

يجب أن ترى استجابة: `{"status":"ok"}`

## المشاكل الشائعة وحلولها

### المشكلة: "relation already exists"
الحل: تم تنفيذ الـ migration مسبقاً، يمكنك تجاهل الخطأ

### المشكلة: "Permission denied"
الحل: تأكد أنك تستخدم **Service Role Key** وليس **Anon Key**

### المشكلة: لا يمكن الاتصال بالـ API
الحل: 
- تحقق من ملفات .env
- تأكد من أن backend يعمل على `:3001`
- تحقق من firewall settings

## الملفات المهمة

- `.env` - متغيرات البيئة للـ backend
- `.env.local` - متغيرات البيئة للـ frontend
- `apps/backend/supabase/migrations/` - ملفات الـ migrations

## الخطوات التالية

بعد إعداد قاعدة البيانات:

1. ✅ حل المشاكل في التطبيق
2. ✅ نشر على Vercel
3. ✅ إعداد متغيرات البيئة للـ Production
