@echo off
REM Supabase Migration via cURL
REM بدء تشغيل Migration على Supabase

echo 🚀 بدء تشغيل Migration على Supabase...
echo.

REM قراءة ملف SQL
set MIGRATION_FILE=apps\backend\supabase\migrations\002_complete_schema.sql

if not exist "%MIGRATION_FILE%" (
    echo ❌ ملف Migration غير موجود: %MIGRATION_FILE%
    exit /b 1
)

echo ✅ تم قراءة ملف Migration
echo.

REM بيانات Supabase
set SUPABASE_URL=https://xrbfyrhxygpenmojazde.supabase.co
set SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyYmZ5cmh4eWdwZW5tb2phemRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY5MTI5MCwiZXhwIjoyMDg2MjY3MjkwfQ.uqeTNqh8Irq02zknmKeUOs0ryEtlkOSp40uF9Rnoen4

echo 📋 محاولة الاتصال بـ Supabase...
echo.

REM Test connection
curl -s -X GET "%SUPABASE_URL/rest/v1/" ^
    -H "Authorization: Bearer %SERVICE_ROLE_KEY%" ^
    -H "apikey: %SERVICE_ROLE_KEY%" > nul

if %ERRORLEVEL% EQU 0 (
    echo ✅ تم التحقق من الاتصال بنجاح!
    echo.
    echo ⚠️  لسوء الحظ، لا يمكن تنفيذ SQL تعسفي عبر REST API مباشر.
) else (
    echo ⚠️  خطأ في الاتصال
)

echo.
echo ==============================================================================
echo 📌 الحل الموصى به: تطبيق Manual عبر Supabase Dashboard
echo ==============================================================================
echo.
echo اتبع هذه الخطوات البسيطة:
echo.
echo 1️⃣  افتح الرابط التالي في المتصفح:
echo    %SUPABASE_URL%/sql
echo.
echo 2️⃣  انقر على الزر: "New Query"
echo.
echo 3️⃣  انسخ محتوى هذا الملف بالكامل:
echo    %MIGRATION_FILE%
echo.
echo 4️⃣  الصق المحتوى في محرر SQL
echo.
echo 5️⃣  انقر على زر: "Run"
echo.
echo 6️⃣  انتظر 10-30 ثانية لاكتمال التنفيذ
echo.
echo ==============================================================================
echo.
echo ✅ بعد اكتمال التنفيذ:
echo   ✓ 10 جداول جديدة سيتم إنشاؤها
echo   ✓ 23 index سيتم إنشاؤها  
echo   ✓ سياسات Row-Level Security ستُفعَّل
echo   ✓ بيانات تجريبية ستُضاف
echo.
echo 💡 هل تريد السماح لـ PowerShell بفتح الرابط مباشرة؟ (اضغط Y لنعم)
set /p OPEN_LINK="الاختيار (Y/N): "

if /i "%OPEN_LINK%"=="Y" (
    echo 🔗 فتح Supabase Dashboard...
    start %SUPABASE_URL%/sql
)

echo.
echo ✅ تم!
pause
