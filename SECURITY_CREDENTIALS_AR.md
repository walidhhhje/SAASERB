# 🔐 ملف الآمان والـ Credentials

**⚠️ تحذير مهم**: هذا الملف يحتوي على بيانات حساسة. لا تشاركه مع أحد!

## 📧 Supabase Credentials

### الحساب الرئيسي
- **Email**: استخدم الـ email الخاص بك
- **Password**: استخدم كلمة مرور قوية
- **URL**: https://supabase.com

### Project Details
```
Project URL:  https://xrbfyrhxygpenmojazde.supabase.co
Project Name: erb-saas
Region:       محفوظ آمن
```

### API Keys

#### 1. Anon Key (للـ Frontend - آمن)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyYmZ5cmh4eWdwZW5tb2phemRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2OTEyOTAsImV4cCI6MjA4NjI2NzI5MH0.awEFpTCEEvTI693M6kvLIDsC7DIkOKptJPJKKlFlaPo
```

**الاستخدام**: Frontend فقط
**الأمان**: يمكن نشره علناً

#### 2. Service Key (للـ Backend - حساس)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyYmZ5cmh4eWdwZW5tb2phemRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY5MTI5MCwiZXhwIjoyMDg2MjY3MjkwfQ.uqeTNqh8Irq02zknmKeUOs0ryEtlkOSp40uF9Rnoen4
```

**الاستخدام**: Backend فقط
**الأمان**: لا تشارك هذا مع أحد!
**التخزين**: في `.env` على الـ server فقط

---

## 🔑 JWT Secret for Auth

### الحالي (للتطوير)
```
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
```

### للـ Production (يجب تغييره!)
```
تولّد secret قوي:
openssl rand -base64 32
```

---

## 📝 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SUPABASE_URL=https://xrbfyrhxygpenmojazde.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyYmZ5cmh4eWdwZW5tb2phemRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2OTEyOTAsImV4cCI6MjA4NjI2NzI5MH0.awEFpTCEEvTI693M6kvLIDsC7DIkOKptJPJKKlFlaPo
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/erb_saas

SUPABASE_URL=https://xrbfyrhxygpenmojazde.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyYmZ5cmh4eWdwZW5tb2phemRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY5MTI5MCwiZXhwIjoyMDg2MjY3MjkwfQ.uqeTNqh8Irq02zknmKeUOs0ryEtlkOSp40uF9Rnoen4

JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
FRONTEND_URL=http://localhost:3000
```

---

## 🔒 قواعد الأمان

### ✅ ما يجب فعله:

1. **Anon Key** (يمكن نشره):
   - في Frontend `.env.local`
   - في متغيرات Vercel environment
   - في ملفات public

2. **Service Key** (لا تشاركه):
   - في Backend `.env`
   - في متغيرات Railway/Render environment
   - ليس في version control!

3. **JWT Secret**:
   - غيّره في الإنتاج
   - اجعله قوي جداً
   - احفظه في secret manager

### ❌ ما لا تفعله:

```
❌ لا تنشر Service Key على GitHub
❌ لا تشارك .env file مع أحد
❌ لا تستخدم JWT Secret ضعيف
❌ لا تضع كلمات المرور في الكود
❌ لا تشارك credentials في Chat
```

---

## 🔄 تغيير الـ Credentials

### إذا تسرب Service Key:

1. اذهب إلى: https://xrbfyrhxygpenmojazde.supabase.co
2. انقر **Settings** → **API**
3. اضغط **Regenerate** لـ Service Key
4. حدّث في جميع الـ servers

### إذا تسرب JWT Secret:

1. أنشئ secret جديد قوي
2. قيّم جميع الـ tokens القديمة
3. أتمم force logout لكل الـ users
4. حدّث في جميع الـ servers

---

## 🛡️ إجراءات الأمان الإضافية

### قبل الـ Production:

```
✓ تفعيل HTTPS على كل الـ domains
✓ تفعيل 2FA على حساب Supabase
✓ تفعيل 2FA على حساب Vercel/Railway
✓ تفعيل RLS policies (تم بالفعل)
✓ تفعيل audit logging (تم بالفعل)
✓ عمل backup regular من Database
✓ مراقبة logs للأنشطة المريبة
✓ تحديث جميع المكتبات بانتظام
```

### بعد الـ Production:

```
✓ مراقبة 24/7 للـ servers
✓ عمل daily backups
✓ تحديثات security patches فوراً
✓ review audit logs أسبوعياً
✓ تحديث JWT Secret شهرياً
✓ فحص الثغرات الأمنية ربع سنوياً
```

---

## 📞 في حالة الطوارئ

### إذا تم اختراق الحساب:

1. **فوراً**:
   - غيّر كلمة مرور Supabase
   - غيّر كلمة مرور Vercel/Railway
   - عطّل كل الـ API keys الحالية

2. **خلال ساعة**:
   - تواصل مع Supabase support
   - revoke جميع الـ sessions
   - أنشئ credentials جديدة

3. **خلال 24 ساعة**:
   - حلّل logs لعرفة ما تم الوصول له
   - بلّغ أي users إن لزم الأمر
   - عمل full security audit

### قنوات الدعم:

- Supabase: support@supabase.com
- Vercel: support@vercel.com
- Railway: support@railway.app

---

## 📊 Access Control

### من لديه الوصول؟

```
حالياً لديك وصول كامل:
- Email: الخاص بك
- Role: Owner
- Permissions: كل شيء

قبل السماح لأحد آخر:
1. أنشئ user منفصل
2. احدد الـ role المناسب
3. احدد الـ permissions المحددة
4. راقب الأنشطة
```

### إضافة مستخدم:

1. في Supabase Dashboard
2. **Authentication** → **Users**
3. أنقر **Add User**
4. أدخل email وكلمة مرور مؤقتة
5. أرسل invitation

---

## 🔐 Role-Based Access

### الأدوار المتاحة:

```
Owner:
- إنشاء/حذف schemas
- إدارة users
- عرض جميع audit logs
- تغيير settings

Admin:
- إنشاء/تحديث schemas
- إنشاء reports
- إدارة integrations

Editor:
- إنشاء/تحديث schemas
- إنشاء/تحديث reports
- عرض own audit logs

Viewer:
- عرض فقط
- لا يمكن تعديل
```

---

## ✅ Checklist الأمان

- [ ] اقرأ هذا الملف كاملاً
- [ ] حفظ الـ credentials في مكان آمن
- [ ] لا تشارك الـ credentials مع أحد
- [ ] فعّل 2FA على Supabase
- [ ] استخدم JWT Secret قوي
- [ ] تفعيل RLS policies ✅ (تم)
- [ ] Audit logging مفعّل ✅ (تم)
- [ ] قبل الـ production: غيّر كل الـ defaults

---

## 📝 تذكيرات يومية

```
كل يوم عند فتح الـ servers:
✓ تفقد الـ alerts والمشاكل
✓ تفقد الـ error logs
✓ تفقد الـ suspicious activities

كل أسبوع:
✓ راجع الـ audit logs
✓ تحقق من الـ disk space
✓ تحقق من الـ bandwidth usage

كل شهر:
✓ حدّث المكتبات
✓ راجع الأمان
✓ عمل backup check
✓ غيّر JWT Secret (اختياري)

كل سنة:
✓ فحص أمان شامل
✓ audit الوصول والأدوار
✓ مراجعة الـ compliance
```

---

**آخر تحديث**: 10 فبراير 2026
**حالة الأمان**: 🟢 آمن

⚠️ **تذكر: البيانات في هذا الملف حساسة جداً. احفظها بأمان!**
