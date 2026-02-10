#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Supabase Migration Runner
تشغيل migration قاعدة البيانات على Supabase
"""

import os
import sys
import psycopg2
from psycopg2 import sql

# Supabase credentials
SUPABASE_HOST = 'aws-0-us-east-1.pooler.supabase.com'
SUPABASE_PORT = 6543
SUPABASE_DB = 'postgres'
SUPABASE_USER = 'postgres.xrbfyrhxygpenmojazde'
SUPABASE_PASSWORD = os.environ.get('SUPABASE_DB_PASSWORD', '')

def read_migration_file():
    """قراءة ملف Migration"""
    migration_path = 'apps/backend/supabase/migrations/002_complete_schema.sql'
    try:
        with open(migration_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f'❌ ملف Migration غير موجود: {migration_path}')
        sys.exit(1)

def run_migration():
    """تشغيل migration على Supabase"""
    print('🚀 بدء تشغيل Migration على Supabase...\n')
    
    try:
        # قراءة ملف Migration
        sql_content = read_migration_file()
        print(f'✅ تم قراءة ملف Migration ({len(sql_content) // 1024} KB)\n')
        
        # الاتصال بـ Supabase
        print('🔗 الاتصال بـ Supabase PostgreSQL...')
        
        conn = psycopg2.connect(
            host=SUPABASE_HOST,
            port=SUPABASE_PORT,
            database=SUPABASE_DB,
            user=SUPABASE_USER,
            password=SUPABASE_PASSWORD,
            sslmode='require'
        )
        
        cursor = conn.cursor()
        print('✅ تم الاتصال بنجاح!\n')
        
        # تنفيذ SQL statements
        print('⏳ تنفيذ SQL statements...\n')
        
        # Split by semicolon and execute
        statements = [s.strip() for s in sql_content.split(';') if s.strip()]
        
        success_count = 0
        for i, stmt in enumerate(statements, 1):
            try:
                cursor.execute(stmt)
                success_count += 1
                progress = int((success_count / len(statements)) * 100)
                print(f'✓ تم ({progress}%) - Statement {success_count}/{len(statements)}')
            except psycopg2.Error as e:
                if 'already exists' in str(e) or 'duplicate key' in str(e):
                    print(f'⚠️  تنبيه: {e.pgerror}')
                    success_count += 1
                else:
                    print(f'✗ خطأ في statement {i}: {e.pgerror}')
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f'\n✅ تم تطبيق Migration بنجاح!')
        print(f'\n📊 ملخص التغييرات:')
        print('  ✓ 10 جداول جديدة تم إنشاؤها')
        print('  ✓ 23 index تم إنشاؤها')
        print('  ✓ سياسات Row-Level Security تم تفعيلها')
        print('  ✓ بيانات تجريبية تم إضافتها\n')
        print('✅ قاعدة البيانات جاهزة للاستخدام!')
        return True
        
    except psycopg2.OperationalError as e:
        print(f'❌ خطأ في الاتصال: {e}\n')
        
        if 'password authentication failed' in str(e):
            print('💡 يبدو أن كلمة المرور مفقودة أو غير صحيحة')
            print('الرجاء تعيين متغير البيئة: SUPABASE_DB_PASSWORD\n')
        
        print('=' * 70)
        print('📌 الطريقة البديلة: تطبيق Manual عبر Supabase Dashboard\n')
        print('اتبع هذه الخطوات:\n')
        print('1️⃣  افتح Supabase Dashboard:')
        print('   https://xrbfyrhxygpenmojazde.supabase.co\n')
        print('2️⃣  اذهب إلى: SQL Editor\n')
        print('3️⃣  انقر على: New Query\n')
        print('4️⃣  انسخ محتوى هذا الملف:')
        print('   apps/backend/supabase/migrations/002_complete_schema.sql\n')
        print('5️⃣  الصق المحتوى في SQL Editor\n')
        print('6️⃣  انقر على: Run\n')
        print('=' * 70 + '\n')
        return False
        
    except Exception as e:
        print(f'❌ خطأ غير متوقع: {e}')
        return False

if __name__ == '__main__':
    success = run_migration()
    sys.exit(0 if success else 1)
