-- Seed data for ERB SaaS system

-- Create demo tenant
INSERT INTO tenants (id, name, slug, subscription_plan)
VALUES ('10000000-0000-0000-0000-000000000001'::uuid, 'Demo Company', 'demo-company', 'pro')
ON CONFLICT DO NOTHING;

-- Create demo user
INSERT INTO users (id, email, encrypted_password, full_name)
VALUES (
  '20000000-0000-0000-0000-000000000001'::uuid,
  'demo@example.com',
  '$2b$10$abc123def456ghi789jkl123',
  'Demo User'
)
ON CONFLICT DO NOTHING;

-- Add user as owner
INSERT INTO tenant_members (id, tenant_id, user_id, role, joined_at)
VALUES (
  '30000000-0000-0000-0000-000000000001'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  '20000000-0000-0000-0000-000000000001'::uuid,
  'owner',
  NOW()
)
ON CONFLICT DO NOTHING;

-- Create demo schema module
INSERT INTO schema_modules (
  id,
  tenant_id,
  name,
  table_name,
  description,
  module_type,
  fields,
  created_by
)
VALUES (
  '40000000-0000-0000-0000-000000000001'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  'Customers',
  'customers',
  'Customer master data',
  'main',
  '[
    {
      "id": "field_1",
      "name": "name",
      "type": "text",
      "required": true,
      "unique": false
    },
    {
      "id": "field_2",
      "name": "email",
      "type": "text",
      "required": true,
      "unique": true
    },
    {
      "id": "field_3",
      "name": "status",
      "type": "select",
      "required": false,
      "unique": false,
      "options": ["active", "inactive", "pending"]
    },
    {
      "id": "field_4",
      "name": "signup_date",
      "type": "date",
      "required": false,
      "unique": false
    }
  ]'::jsonb,
  '20000000-0000-0000-0000-000000000001'::uuid
)
ON CONFLICT DO NOTHING;

-- Create demo report
INSERT INTO reports (
  id,
  tenant_id,
  name,
  description,
  module_id,
  query_builder,
  chart_config,
  created_by,
  is_shared
)
VALUES (
  '50000000-0000-0000-0000-000000000001'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  'Active Customers',
  'Report showing active customers',
  '40000000-0000-0000-0000-000000000001'::uuid,
  '{
    "combinator": "and",
    "rules": [
      {
        "field": "status",
        "operator": "equals",
        "value": "active"
      }
    ]
  }'::jsonb,
  '{
    "type": "bar",
    "xAxis": "name",
    "yAxis": ["status"],
    "title": "Active Customers"
  }'::jsonb,
  '20000000-0000-0000-0000-000000000001'::uuid,
  true
)
ON CONFLICT DO NOTHING;

-- Create audit log entry
INSERT INTO audit_logs (
  tenant_id,
  user_id,
  action,
  entity_type,
  entity_id
)
VALUES (
  '10000000-0000-0000-0000-000000000001'::uuid,
  '20000000-0000-0000-0000-000000000001'::uuid,
  'create',
  'schema_module',
  '40000000-0000-0000-0000-000000000001'::uuid
);
