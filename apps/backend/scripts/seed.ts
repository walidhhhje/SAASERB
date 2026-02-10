import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  try {
    // Create test organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: 'Demo Organization',
        slug: 'demo-org',
        settings: {
          theme: 'light',
          language: 'en',
        },
      })
      .select()
      .single();

    if (orgError) throw orgError;
    console.log('✓ Created organization:', org.id);

    // Create test schema
    const { data: schema, error: schemaError } = await supabase
      .from('erb_schemas')
      .insert({
        org_id: org.id,
        name: 'Customer',
        slug: 'customer',
        description: 'Customer data structure',
        status: 'published',
        definition: {
          fields: [
            {
              id: '1',
              name: 'first_name',
              type: 'text',
              required: true,
              unique: false,
            },
            {
              id: '2',
              name: 'last_name',
              type: 'text',
              required: true,
              unique: false,
            },
            {
              id: '3',
              name: 'email',
              type: 'email',
              required: true,
              unique: true,
            },
            {
              id: '4',
              name: 'phone',
              type: 'text',
              required: false,
              unique: false,
            },
            {
              id: '5',
              name: 'status',
              type: 'select',
              required: false,
              unique: false,
              options: [
                { id: '1', label: 'Active', value: 'active' },
                { id: '2', label: 'Inactive', value: 'inactive' },
                { id: '3', label: 'Pending', value: 'pending' },
              ],
            },
          ],
          relations: [],
          indexes: [],
        },
        table_name: 'customer',
      })
      .select()
      .single();

    if (schemaError) throw schemaError;
    console.log('✓ Created schema:', schema.id);

    // Create sample records
    const { data: records, error: recordsError } = await supabase
      .from('erb_records')
      .insert([
        {
          schema_id: schema.id,
          org_id: org.id,
          tenant_id: org.id,
          module_type: 'main',
          data: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            status: 'active',
          },
        },
        {
          schema_id: schema.id,
          org_id: org.id,
          tenant_id: org.id,
          module_type: 'main',
          data: {
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane@example.com',
            phone: '+0987654321',
            status: 'active',
          },
        },
        {
          schema_id: schema.id,
          org_id: org.id,
          tenant_id: org.id,
          module_type: 'main',
          data: {
            first_name: 'Bob',
            last_name: 'Johnson',
            email: 'bob@example.com',
            phone: null,
            status: 'pending',
          },
        },
      ])
      .select();

    if (recordsError) throw recordsError;
    console.log('✓ Created', records?.length || 0, 'sample records');

    // Create sample report
    const { data: report, error: reportError } = await supabase
      .from('erb_reports')
      .insert({
        org_id: org.id,
        schema_id: schema.id,
        name: 'Active Customers',
        description: 'Report of all active customers',
        query: {
          combinator: 'and',
          rules: [
            {
              field: 'status',
              operator: 'equals',
              value: 'active',
            },
          ],
        },
        visualization_type: 'table',
        status: 'published',
      })
      .select()
      .single();

    if (reportError) throw reportError;
    console.log('✓ Created report:', report.id);

    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
