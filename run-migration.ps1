# Supabase Migration Setup Script
$SUPABASE_URL = "https://xrbfyrhxygpenmojazde.supabase.co"

Write-Host "🚀 بدء تشغيل Migration على Supabase...`n" -ForegroundColor Green

$MIGRATION_FILE = "apps/backend/supabase/migrations/002_complete_schema.sql"

if (-Not (Test-Path $MIGRATION_FILE)) {
    Write-Host "❌ ملف Migration غير موجود: $MIGRATION_FILE" -ForegroundColor Red
    exit 1
}

$sqlContent = Get-Content $MIGRATION_FILE -Raw
$fileSizeKB = [math]::Round($sqlContent.Length / 1024)
Write-Host "✅ تم قراءة ملف Migration ($fileSizeKB KB)`n" -ForegroundColor Green

Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host "`n📌 تطبيق Database Migration على Supabase`n" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host "`n1️⃣  افتح Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "   $SUPABASE_URL/sql`n" -ForegroundColor Cyan
Write-Host "2️⃣  انقر على: New Query`n" -ForegroundColor Yellow
Write-Host "3️⃣  انسخ محتوى الملف:" -ForegroundColor Yellow
Write-Host "   $MIGRATION_FILE`n" -ForegroundColor Cyan
Write-Host "4️⃣  الصق في محرر SQL`n" -ForegroundColor Yellow
Write-Host "5️⃣  اضغط: Ctrl+Enter أو انقر Run`n" -ForegroundColor Yellow
Write-Host "6️⃣  انتظر 10-30 ثانية لاكتمال`n" -ForegroundColor Yellow

Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host "`n✅ ستحصل على:" -ForegroundColor Green
Write-Host "  ✓ 10 جداول جديدة" -ForegroundColor Green
Write-Host "  ✓ 23 index" -ForegroundColor Green
Write-Host "  ✓ سياسات أمان RLS" -ForegroundColor Green
Write-Host "  ✓ بيانات تجريبية`n" -ForegroundColor Green

Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host "`nاضغط أي زر للإغلاق..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
