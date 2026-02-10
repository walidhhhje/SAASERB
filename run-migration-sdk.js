const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://xrbfyrhxygpenmojazde.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyYmZ5cmh4eWdwZW5tb2phemRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY5MTI5MCwiZXhwIjoyMDg2MjY3MjkwfQ.uqeTNqh8Irq02zknmKeUOs0ryEtlkOSp40uF9Rnoen4';

async function runMigration() {
  console.log('🚀 بدء تشغيل Migration على Supabase...\n');
  
  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'apps/backend/supabase/migrations/002_complete_schema.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    console.log(`✅ تم قراءة ملف Migration (${Math.round(sqlContent.length / 1024)} KB)\n`);

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    console.log('✅ تم إنشاء Supabase client\n');

    // Method 1: Try to execute via direct REST API
    console.log('📋 محاولة الطريقة 1: استخدام Supabase REST API...\n');
    
    // Split SQL by statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`المجموع: ${statements.length} statement\n`);
    
    // Try to execute first statement to test connection
    try {
      const testResult = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY,
        }
      });
      
      if (testResult.ok) {
        console.log('✅ تم التحقق من اتصال Supabase!');
      }
    } catch (e) {
      console.log('⚠️ لم يتمكن من التحقق من الاتصال');
    }

    // Try uploading SQL migration via Supabase management API
    console.log('\n📋 محاولة الطريقة 2: رفع Migration عبر Supabase API...\n');

    const migrationResponse = await fetch(
      `${SUPABASE_URL}/platform/v1/projects/xrbfyrhxygpenmojazde/database/migrations`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: '002_complete_schema',
          version: '1.0.0',
          statements: statements,
        })
      }
    );

    if (migrationResponse.ok) {
      const result = await migrationResponse.json();
      console.log('✅ تم رفع Migration بنجاح!');
      console.log(JSON.stringify(result, null, 2));
      return true;
    } else {
      const error = await migrationResponse.text();
      console.log('⚠️ لم تنجح Supabase Management API\n');
      console.log('الاستجابة:', error);
    }

    // If all else fails, show manual instructions
    console.log('\n' + '='.repeat(70));
    console.log('📌 الطريقة النهائية: تطبيق Manual عبر Supabase Dashboard\n');
    console.log('اتبع هذه الخطوات:\n');
    console.log('1️⃣  افتح الرابط التالي:');
    console.log('   https://xrbfyrhxygpenmojazde.supabase.co/sql\n');
    console.log('2️⃣  انقر على: "New Query"\n');
    console.log('3️⃣  انسخ والصق محتوى الملف:');
    console.log('   apps/backend/supabase/migrations/002_complete_schema.sql\n');
    console.log('4️⃣  انقر على: "Run"\n');
    console.log('5️⃣  انتظر اكتمال التنفيذ (حوالي 10-30 ثانية)\n');
    console.log('=' .repeat(70) + '\n');
    
    return false;

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    
    console.log('\n' + '='.repeat(70));
    console.log('📌 الطريقة النهائية: تطبيق Manual\n');
    console.log('1️⃣  افتح: https://xrbfyrhxygpenmojazde.supabase.co/sql');
    console.log('2️⃣  انسخ محتوى: apps/backend/supabase/migrations/002_complete_schema.sql');
    console.log('3️⃣  الصقه واضغط Run');
    console.log('=' .repeat(70) + '\n');
    
    return false;
  }
}

runMigration().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
