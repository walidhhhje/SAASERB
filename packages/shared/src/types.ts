// Multi-tenant SaaS types

export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';
export type ModuleType = 'main' | 'sub';
export type IntegrationType = 'notion' | 'freshdesk' | 'freshchat';

// Database Models
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  subscription_plan: SubscriptionPlan;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  features: Record<string, unknown>;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  encrypted_password: string;
  full_name?: string;
  avatar_url?: string;
  oauth_provider?: string;
  oauth_id?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface TenantMember {
  id: string;
  tenant_id: string;
  user_id: string;
  role: UserRole;
  invited_at: string;
  joined_at?: string;
  created_at: string;
}

export interface SchemaField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'select' | 'multiselect' | 'json';
  required: boolean;
  unique: boolean;
  defaultValue?: unknown;
  options?: string[];
  metadata?: Record<string, unknown>;
}

export interface SchemaModule {
  id: string;
  tenant_id: string;
  name: string;
  table_name: string;
  description?: string;
  parent_module_id?: string;
  module_type: ModuleType;
  fields: SchemaField[];
  settings: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DynamicTable {
  id: string;
  tenant_id: string;
  module_id: string;
  table_name: string;
  created_at: string;
}

export interface QueryBuilderCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in';
  value: unknown;
  combinator?: 'and' | 'or';
}

export interface QueryBuilderGroup {
  id: string;
  combinator: 'and' | 'or';
  rules: (QueryBuilderCondition | QueryBuilderGroup)[];
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  xAxis: string;
  yAxis: string[];
  title?: string;
  customConfig?: Record<string, unknown>;
}

export interface Report {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  module_id?: string;
  query_builder: QueryBuilderGroup;
  chart_config?: ChartConfig;
  looker_studio_url?: string;
  created_by: string;
  is_shared: boolean;
  shared_with: string[];
  created_at: string;
  updated_at: string;
}

export interface Integration {
  id: string;
  tenant_id: string;
  integration_type: IntegrationType;
  config: {
    api_key?: string;
    access_token?: string;
    workspace_id?: string;
    database_id?: string;
    channel_id?: string;
    [key: string]: unknown;
  };
  is_active: boolean;
  last_sync?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  changes?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface CollaborationSession {
  id: string;
  tenant_id: string;
  module_id: string;
  created_by: string;
  active_users: string[];
  created_at: string;
  updated_at: string;
}

// API Request/Response types
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
}

export interface SchemaBuilderRequest {
  name: string;
  table_name: string;
  description?: string;
  parent_module_id?: string;
  module_type: ModuleType;
  fields: SchemaField[];
}

export interface ReportRequest {
  name: string;
  description?: string;
  module_id?: string;
  query_builder: QueryBuilderGroup;
  chart_config?: ChartConfig;
  looker_studio_url?: string;
  is_shared?: boolean;
}

export interface IntegrationRequest {
  integration_type: IntegrationType;
  config: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
