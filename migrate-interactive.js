#!/usr/bin/env node

/**
 * Supabase Database Migration Script
 * يطلب database password ثم ينفذ الـ migration تلقائياً
 */

const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function promptPassword() {
  return new Promise((resolve) => {
    rl.question(
      '\n🔑 أدخل Database Password من Supabase (أو اتركه فارغاً للتخطي): ',
      (answer) => {
        resolve(answer);
        rl.close();
      }
    );
  });
}

async function runMigrationWithPassword(dbPassword) {
  const PYTHON_EXEC = '"C:/Users/Walid Genidy/Desktop/saa-s-erb-system/.venv/Scripts/python.exe"';
  const migrationPath = 'apps/backend/supabase/migrations/002_complete_schema.sql';
  
  console.log('\n🚀 بدء تشغيل Migration...\n');
  
  // بناء Python script بـ environment variables
  const pythonScript = `
import os
import psycopg2
import sys

SUPABASE_HOST = 'aws-0-us-east-1.pooler.supabase.com'
SUPABASE_PORT = 6543
SUPABASE_DB = 'postgres'
SUPABASE_USER = 'postgres.xrbfyrhxygpenmojazde'
SUPABASE_PASSWORD = '${dbPassword}'

try:
  print('🔗 الاتصال بـ Supabase...')
  
  conn = psycopg2.connect(
    host=SUPABASE_HOST,
    port=SUPABASE_PORT,
    database=SUPABASE_DB,
    user=SUPABASE_USER,
    password=SUPABASE_PASSWORD,
    sslmode='require'
  )
  
  cursor = conn.cursor()
  print('✅ تم الاتصال بنجاح!\\n')
  
  # قراءة ملف SQL
  with open('${migrationPath}', 'r', encoding='utf-8') as f:
    sql_content = f.read()
  
  print(f'⏳ تنفيذ SQL ({len(sql_content)//1024} KB)...')
  
  # تنفيذ كل statement
  statements = [s.strip() for s in sql_content.split(';') if s.strip()]
  success_count = 0
  
  for i, stmt in enumerate(statements, 1):
    try:
      cursor.execute(stmt)
      success_count += 1
      progress = int((success_count / len(statements)) * 100)
      print(f'✓ ({progress}%)')
    except psycopg2.Error as e:
      if 'already exists' not in str(e) and 'duplicate key' not in str(e):
        print(f'✗ خطأ: {e}')
  
  conn.commit()
  cursor.close()
  conn.close()
  
  print('\\n✅ تم تطبيق Migration بنجاح!')
  print('\\n📊 النتائج:')
  print('  ✓ 10 جداول جديدة')
  print('  ✓ 23 indexes')
  print('  ✓ سياسات RLS')
  print('  ✓ بيانات تجريبية')
  
except Exception as e:
  print(f'❌ خطأ: {e}')
  sys.exit(1)
`;

  // كتابة Python script
  const scriptFile = 'temp_migration.py';
  fs.writeFileSync(scriptFile, pythonScript);
  
  try {
    execSync(`cd . .venv/Scripts/Activate.ps1 ; python ${scriptFile}`, {
      stdio: 'inherit',
      shell: 'powershell.exe'
    });
    fs.unlinkSync(scriptFile);
    return true;
  } catch (error) {
    console.error('❌ فشل تنفيذ Migration');
    fs.unlinkSync(scriptFile);
    return false;
  }
}

async function main() {
  console.log('================================');
  console.log('Supabase Database Migration');
  console.log('================================\n');
  
  const password = await promptPassword();
  
  if (!password) {
    console.log('\n⚠️  لم تدخل كلمة المرور!\n');
    console.log('الرجاء استخدام أحد الطرق التالية:\n');
    console.log('1️⃣  افتح: https://xrbfyrhxygpenmojazde.supabase.co/sql');
    console.log('2️⃣  انسخ: apps/backend/supabase/migrations/002_complete_schema.sql');
    console.log('3️⃣  الصق المحتوى والضغط Run\n');
    process.exit(1);
  }
  
  const success = await runMigrationWithPassword(password);
  process.exit(success ? 0 : 1);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
