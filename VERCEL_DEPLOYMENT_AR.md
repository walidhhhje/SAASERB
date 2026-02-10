# خطوات النشر على Vercel

## المتطلبات

1. ✅ حساب GitHub (مع رفع المشروع)
2. ✅ حساب Vercel مجاني على https://vercel.com
3. ✅ Supabase مهيأ (تم إنشاء قاعدة البيانات)

## الخطوة 1: رفع المشروع على GitHub

```bash
# تهيئة Git (إذا لم تكن قد فعلت)
git init
git add .
git commit -m "Initial commit: ERB SaaS system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/erb-saas.git
git push -u origin main
```

## الخطوة 2: نشر Frontend على Vercel

### طريقة 1: عبر Vercel Dashboard

1. اذهب إلى https://vercel.com
2. انقر **Add New** → **Project**
3. اختر **Import Git Repository**
4. اختر repo الخاص بك `erb-saas`
5. انقر **Import**
6. في **Configure Project**:
   - **Root Directory**: `apps/web`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

7. انقر **Environment Variables** وأضف:

```
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-URL/api
NEXT_PUBLIC_SUPABASE_URL=https://xrbfyrhxygpenmojazde.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyYmZ5cmh4eWdwZW5tb2phemRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2OTEyOTAsImV4cCI6MjA4NjI2NzI5MH0.awEFpTCEEvTI693M6kvLIDsC7DIkOKptJPJKKlFlaPo
NEXT_PUBLIC_APP_URL=https://YOUR-FRONTEND-URL
```

8. انقر **Deploy**

### طريقة 2: عبر Vercel CLI

```bash
npm i -g vercel

# الدخول
vercel login

# النشر
cd apps/web
vercel --prod
```

## الخطوة 3: نشر Backend

للـ Backend، لديك خيارات:

### Option A: Railway (موصى به للـ backend)

1. اذهب إلى https://railway.app
2. انقر **New Project** → **Deploy from GitHub**
3. اختر repo الخاص بك
4. أضف Environment Variables:

```
PORT=3001
NODE_ENV=production
SUPABASE_URL=https://xrbfyrhxygpenmojazde.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyYmZ5cmh4eWdwZW5tb2phemRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY5MTI5MCwiZXhwIjoyMDg2MjY3MjkwfQ.uqeTNqh8Irq02zknmKeUOs0ryEtlkOSp40uF9Rnoen4
JWT_SECRET=your-secret-key-here-change-in-production
FRONTEND_URL=https://YOUR-FRONTEND-URL
```

5. اختر root directory: `apps/backend`
6. انقر **Deploy**

### Option B: Render (بديل آخر)

1. اذهب إلى https://render.com
2. انقر **New** → **Web Service**
3. اختر GitHub repository
4. في Configuration:
   - Root Directory: `apps/backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. أضف Environment Variables
6. انقر **Deploy**

## الخطوة 4: تحديث Frontend مع Backend URL

بعد نشر Backend، تحدث frontend environment:

```
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-DOMAIN/api
```

ثم أعد deploy الـ frontend.

## الخطوة 5: اختبار التطبيق

1. افتح Frontend URL: https://YOUR-FRONTEND-URL
2. سجل حساب جديد
3. اختبر جميع الميزات:
   - ✅ تسجيل دخول/خروج
   - ✅ إنشاء schema
   - ✅ إنشاء report
   - ✅ عرض audit logs

## تحديث البيانات بعد النشر

للحصول على أحدث البيانات:

```bash
git pull
# تحديث البيانات في Supabase إذا لزم الأمر
```

## استكشاف الأخطاء

### خطأ: CORS
- تحقق من `FRONTEND_URL` في backend
- تأكد من تطابق الـ domain

### خطأ: Connection Refused
- تحقق من `NEXT_PUBLIC_API_URL`
- تأكد أن Backend يعمل

### خطأ: Database Connection
- تحقق من Supabase credentials
- تأكد من الـ RLS policies

## الاختبار المحلي قبل النشر

```bash
# اختبر التطبيق محلياً أولاً
npm run dev

# افتح http://localhost:3000
# اختبر جميع الميزات
```

## الـ Monitoring والـ Logs

### Vercel Logs
- اذهب إلى Dashboard
- انقر على Project
- انقر **Deployments**
- اختر آخر deployment
- شاهد **Logs**

### Railway/Render Logs
- اذهب إلى Project Dashboard
- انقر **Logs**
- شاهد real-time logs

## الخطوات التالية

بعد النشر الناجح:

1. ✅ اختبر جميع الميزات
2. ✅ أضف custom domain
3. ✅ فعّل HTTPS
4. ✅ أعد monitoring و logging
5. ✅ أعد backup strategy

## الدعم والمساعدة

للمساعدة:
- افتح issue على GitHub
- راجع DEVELOPMENT.md للمشاكل الشائعة
- تحقق من logs

---

**Note**: تأكد من أن جميع المتغيرات مُحدثة قبل النشر على الـ production!
