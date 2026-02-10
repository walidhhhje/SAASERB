-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Multi-tenant organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Users with tenant assignment
CREATE TABLE auth_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Dynamic schema definitions (ERB schema builder output)
CREATE TABLE erb_schemas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  definition JSONB NOT NULL, -- Contains field definitions, relations, constraints
  table_name TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(org_id, slug)
);

-- Dynamic data tables (created from erb_schemas)
-- Master table for all dynamic records with multi-tenant support
CREATE TABLE erb_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schema_id UUID NOT NULL REFERENCES erb_schemas(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL DEFAULT org_id,
  module_type TEXT DEFAULT 'main' CHECK (module_type IN ('main', 'sub')),
  parent_id UUID REFERENCES erb_records(id) ON DELETE CASCADE,
  data JSONB NOT NULL, -- Dynamic fields stored as JSON
  version INT DEFAULT 1,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Audit log for tracking changes
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth_users(id),
  entity_type TEXT NOT NULL, -- 'schema', 'record', 'integration', etc.
  entity_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'publish'
  changes JSONB, -- Before/after values
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Report definitions (using react-querybuilder)
CREATE TABLE erb_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  schema_id UUID REFERENCES erb_schemas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  query JSONB NOT NULL, -- react-querybuilder format
  visualization_type TEXT DEFAULT 'table' CHECK (visualization_type IN ('table', 'chart', 'map', 'timeline')),
  chart_config JSONB,
  sql_query TEXT, -- Generated or custom SQL
  looker_embed_url TEXT,
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES auth_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(org_id, name)
);

-- Report executions and results
CREATE TABLE report_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES erb_reports(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  results JSONB,
  execution_time_ms INT,
  row_count INT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'error')),
  error_message TEXT,
  executed_by UUID REFERENCES auth_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Integration credentials and configuration
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('notion', 'freshdesk', 'freshchat', 'stripe', 'looker', 'custom')),
  name TEXT NOT NULL,
  config JSONB NOT NULL, -- Encrypted credentials stored
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(org_id, type, name)
);

-- Notion sync mappings
CREATE TABLE notion_syncs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  notion_database_id TEXT NOT NULL,
  schema_id UUID REFERENCES erb_schemas(id),
  field_mapping JSONB, -- Maps Notion fields to ERB schema fields
  sync_direction TEXT DEFAULT 'bi' CHECK (sync_direction IN ('one-way', 'bi')),
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Freshdesk tickets sync
CREATE TABLE freshdesk_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  freshdesk_ticket_id TEXT NOT NULL,
  schema_id UUID REFERENCES erb_schemas(id),
  record_id UUID REFERENCES erb_records(id),
  status TEXT DEFAULT 'pending',
  synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(org_id, freshdesk_ticket_id)
);

-- Billing and subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  stripe_subscription_id TEXT,
  plan_id TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'unpaid')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Real-time collaboration: Active sessions
CREATE TABLE collaboration_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schema_id UUID NOT NULL REFERENCES erb_schemas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  cursor_position JSONB,
  session_token TEXT UNIQUE,
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Real-time changes: Change events for WebSocket sync
CREATE TABLE change_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  schema_id UUID REFERENCES erb_schemas(id),
  record_id UUID REFERENCES erb_records(id),
  event_type TEXT NOT NULL, -- 'created', 'updated', 'deleted'
  changes JSONB,
  user_id UUID REFERENCES auth_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for performance
CREATE INDEX idx_auth_users_org_id ON auth_users(org_id);
CREATE INDEX idx_erb_schemas_org_id ON erb_schemas(org_id);
CREATE INDEX idx_erb_records_org_id ON erb_records(org_id);
CREATE INDEX idx_erb_records_schema_id ON erb_records(schema_id);
CREATE INDEX idx_erb_records_parent_id ON erb_records(parent_id);
CREATE INDEX idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_erb_reports_org_id ON erb_reports(org_id);
CREATE INDEX idx_integrations_org_id ON integrations(org_id);
CREATE INDEX idx_change_events_org_id ON change_events(org_id);
CREATE INDEX idx_change_events_created_at ON change_events(created_at);

-- RLS (Row Level Security) Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE erb_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE erb_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE erb_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view their own organization" ON organizations
  FOR SELECT USING (
    id IN (SELECT org_id FROM auth_users WHERE id = auth.uid())
  );

-- RLS Policies for auth_users
CREATE POLICY "Users can view org members" ON auth_users
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM auth_users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update own profile" ON auth_users
  FOR UPDATE USING (id = auth.uid());

-- RLS Policies for erb_schemas
CREATE POLICY "Users can view org schemas" ON erb_schemas
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM auth_users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create schemas in their org" ON erb_schemas
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM auth_users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update schemas in their org" ON erb_schemas
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM auth_users WHERE id = auth.uid())
  );

-- RLS Policies for erb_records
CREATE POLICY "Users can view records in their org" ON erb_records
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM auth_users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create records in their org" ON erb_records
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM auth_users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update records in their org" ON erb_records
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM auth_users WHERE id = auth.uid())
  );

-- RLS Policies for audit_logs
CREATE POLICY "Users can view audit logs in their org" ON audit_logs
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM auth_users WHERE id = auth.uid())
  );

-- RLS Policies for reports
CREATE POLICY "Users can view reports in their org" ON erb_reports
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM auth_users WHERE id = auth.uid())
  );

-- RLS Policies for integrations
CREATE POLICY "Users can view integrations in their org" ON integrations
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM auth_users WHERE id = auth.uid())
  );

-- RLS Policies for change_events
CREATE POLICY "Users can view changes in their org" ON change_events
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM auth_users WHERE id = auth.uid())
  );
