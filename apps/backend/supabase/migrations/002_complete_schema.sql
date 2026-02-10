-- Complete ERB Database Schema for Supabase
-- This migration sets up all required tables with RLS policies

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================== CORE TABLES ====================

-- 1. Tenants (Organizations)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  features JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  oauth_provider TEXT,
  oauth_id TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Tenant Members (User-Tenant Relationships)
CREATE TABLE IF NOT EXISTS tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- 4. Schema Modules (Data definitions)
CREATE TABLE IF NOT EXISTS schema_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  table_name TEXT NOT NULL,
  description TEXT,
  parent_module_id UUID REFERENCES schema_modules(id) ON DELETE CASCADE,
  module_type TEXT DEFAULT 'main' CHECK (module_type IN ('main', 'sub')),
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id, table_name)
);

-- 5. Dynamic Tables Registry
CREATE TABLE IF NOT EXISTS dynamic_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES schema_modules(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  sql_definition TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id, table_name)
);

-- 6. Reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  module_id UUID REFERENCES schema_modules(id),
  query_builder JSONB NOT NULL,
  chart_config JSONB,
  looker_studio_url TEXT,
  visualization_type TEXT DEFAULT 'table' CHECK (visualization_type IN ('table', 'chart', 'map', 'timeline')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID REFERENCES users(id),
  is_shared BOOLEAN DEFAULT FALSE,
  shared_with JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Report Executions
CREATE TABLE IF NOT EXISTS report_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  results JSONB,
  execution_time_ms INT,
  row_count INT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'error')),
  error_message TEXT,
  executed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Integrations
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('notion', 'freshdesk', 'freshchat', 'stripe', 'looker', 'custom')),
  name TEXT,
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id, integration_type)
);

-- 9. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 10. Collaboration Sessions
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES schema_modules(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  active_users JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==================== INDEXES ====================

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_is_active ON tenants(is_active);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);

CREATE INDEX idx_tenant_members_tenant ON tenant_members(tenant_id);
CREATE INDEX idx_tenant_members_user ON tenant_members(user_id);
CREATE INDEX idx_tenant_members_role ON tenant_members(role);

CREATE INDEX idx_schema_modules_tenant ON schema_modules(tenant_id);
CREATE INDEX idx_schema_modules_parent ON schema_modules(parent_module_id);
CREATE INDEX idx_schema_modules_status ON schema_modules(status);

CREATE INDEX idx_dynamic_tables_tenant ON dynamic_tables(tenant_id);

CREATE INDEX idx_reports_tenant ON reports(tenant_id);
CREATE INDEX idx_reports_module ON reports(module_id);
CREATE INDEX idx_reports_status ON reports(status);

CREATE INDEX idx_report_executions_report ON report_executions(report_id);
CREATE INDEX idx_report_executions_tenant ON report_executions(tenant_id);

CREATE INDEX idx_integrations_tenant ON integrations(tenant_id);
CREATE INDEX idx_integrations_type ON integrations(integration_type);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

CREATE INDEX idx_collaboration_sessions_tenant ON collaboration_sessions(tenant_id);
CREATE INDEX idx_collaboration_sessions_module ON collaboration_sessions(module_id);

-- ==================== ENABLE ROW LEVEL SECURITY ====================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;

-- ==================== RLS POLICIES ====================

-- Tenants: Users can only see their own tenants through tenant_members
CREATE POLICY "Users can view their tenants" ON tenants
  FOR SELECT
  USING (
    id IN (
      SELECT tenant_id FROM tenant_members 
      WHERE user_id = auth.uid()::uuid
    )
  );

-- Users: Users can view all users (for team features)
CREATE POLICY "Users are viewable by authenticated users" ON users
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Tenant Members: Users can only see members of their own tenants
CREATE POLICY "Users can see members of their tenants" ON tenant_members
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members 
      WHERE user_id = auth.uid()::uuid
    )
  );

-- Schema Modules: Users can only access schemas in their tenants
CREATE POLICY "Users can access their tenant schemas" ON schema_modules
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members 
      WHERE user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "Editors can create/update schemas" ON schema_modules
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members 
      WHERE user_id = auth.uid()::uuid AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Editors can update schemas" ON schema_modules
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members 
      WHERE user_id = auth.uid()::uuid AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Owners can delete schemas" ON schema_modules
  FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members 
      WHERE user_id = auth.uid()::uuid AND role IN ('owner', 'admin')
    )
  );

-- Dynamic Tables: Users can access tables in their tenants
CREATE POLICY "Users can access their tenant tables" ON dynamic_tables
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members 
      WHERE user_id = auth.uid()::uuid
    )
  );

-- Reports: Users can access reports in their tenants
CREATE POLICY "Users can access their tenant reports" ON reports
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members 
      WHERE user_id = auth.uid()::uuid
    ) OR is_shared = TRUE
  );

CREATE POLICY "Editors can create reports" ON reports
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members 
      WHERE user_id = auth.uid()::uuid AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Editors can update reports" ON reports
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members 
      WHERE user_id = auth.uid()::uuid AND role IN ('owner', 'admin', 'editor')
    )
  );

-- Report Executions
CREATE POLICY "Users can view report executions" ON report_executions
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members 
      WHERE user_id = auth.uid()::uuid
    )
  );

-- Integrations: Owners and admins can manage
CREATE POLICY "Users can view integrations" ON integrations
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members 
      WHERE user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "Admins can create integrations" ON integrations
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members 
      WHERE user_id = auth.uid()::uuid AND role IN ('owner', 'admin')
    )
  );

-- Audit Logs: Users can view logs for their tenants
CREATE POLICY "Users can view their audit logs" ON audit_logs
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members 
      WHERE user_id = auth.uid()::uuid
    )
  );

-- Collaboration Sessions
CREATE POLICY "Users can see collaboration sessions" ON collaboration_sessions
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members 
      WHERE user_id = auth.uid()::uuid
    )
  );

-- ==================== SEED DATA ====================

-- Create demo tenant
INSERT INTO tenants (name, slug, subscription_plan)
VALUES ('Demo Company', 'demo-company', 'pro')
ON CONFLICT DO NOTHING;

-- Create demo user
INSERT INTO users (email, encrypted_password, full_name)
VALUES (
  'demo@example.com',
  '$2b$10$abc123def456ghi789jkl123456789012345678901234567890',
  'Demo User'
)
ON CONFLICT (email) DO NOTHING;

-- Link user to tenant
INSERT INTO tenant_members (tenant_id, user_id, role, joined_at)
SELECT 
  (SELECT id FROM tenants WHERE slug = 'demo-company'),
  (SELECT id FROM users WHERE email = 'demo@example.com'),
  'owner',
  NOW()
ON CONFLICT DO NOTHING;

-- Create demo schema module
INSERT INTO schema_modules (tenant_id, name, table_name, description, module_type, fields, created_by)
SELECT
  (SELECT id FROM tenants WHERE slug = 'demo-company'),
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
  (SELECT id FROM users WHERE email = 'demo@example.com')
ON CONFLICT DO NOTHING;

-- Create demo report
INSERT INTO reports (tenant_id, name, description, module_id, query_builder, chart_config, created_by, is_shared)
SELECT
  (SELECT id FROM tenants WHERE slug = 'demo-company'),
  'Active Customers',
  'Report showing active customers',
  (SELECT id FROM schema_modules WHERE table_name = 'customers'),
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
  (SELECT id FROM users WHERE email = 'demo@example.com'),
  true
ON CONFLICT DO NOTHING;
