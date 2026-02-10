// Organization
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// User with tenant support
export interface AuthUser {
  id: string;
  org_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'inactive' | 'invited';
  created_at: string;
  updated_at: string;
}

// ERB Schema Definition
export interface ERBSchema {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  definition: SchemaDefinition;
  table_name: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Schema field definition for drag-drop builder
export interface SchemaDefinition {
  fields: SchemaField[];
  relations?: SchemaRelation[];
  indexes?: SchemaIndex[];
  settings?: Record<string, any>;
}

export interface SchemaField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect' | 'email' | 'url' | 'json' | 'file' | 'user' | 'lookup';
  required: boolean;
  unique?: boolean;
  defaultValue?: any;
  description?: string;
  validation?: FieldValidation;
  display?: FieldDisplay;
  options?: SelectOption[]; // For select/multiselect
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  customRules?: string[];
}

export interface FieldDisplay {
  width?: number;
  format?: string;
  hideInView?: boolean;
  hideInForm?: boolean;
}

export interface SelectOption {
  id: string;
  label: string;
  value: string;
  color?: string;
}

export interface SchemaRelation {
  id: string;
  name: string;
  from_field: string;
  to_schema: string;
  to_field: string;
  type: 'one-to-many' | 'many-to-many' | 'one-to-one';
  cascadeDelete?: boolean;
}

export interface SchemaIndex {
  fields: string[];
  unique?: boolean;
  sparse?: boolean;
}

// Dynamic record with JSONB data
export interface ERBRecord {
  id: string;
  schema_id: string;
  org_id: string;
  tenant_id: string;
  module_type: 'main' | 'sub';
  parent_id?: string;
  data: Record<string, any>;
  version: number;
  is_deleted: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Audit log
export interface AuditLog {
  id: string;
  org_id: string;
  user_id?: string;
  entity_type: string;
  entity_id: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'sync';
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Report with query builder
export interface ERBReport {
  id: string;
  org_id: string;
  schema_id?: string;
  name: string;
  description?: string;
  query: QueryBuilderValue;
  visualization_type: 'table' | 'chart' | 'map' | 'timeline';
  chart_config?: ChartConfig;
  sql_query?: string;
  looker_embed_url?: string;
  status: 'draft' | 'published' | 'archived';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// React Query Builder format
export interface QueryBuilderValue {
  combinator: 'and' | 'or';
  rules: QueryRule[];
}

export interface QueryRule {
  field?: string;
  operator?: string;
  value?: any;
  combinator?: 'and' | 'or';
  rules?: QueryRule[];
}

export interface ChartConfig {
  xAxis?: string;
  yAxis?: string[];
  chartType?: string;
  legend?: boolean;
  animation?: boolean;
  [key: string]: any;
}

// Report execution result
export interface ReportExecution {
  id: string;
  report_id: string;
  org_id: string;
  results?: Record<string, any>[];
  execution_time_ms: number;
  row_count: number;
  status: 'pending' | 'running' | 'success' | 'error';
  error_message?: string;
  executed_by?: string;
  created_at: string;
}

// Integration configuration
export interface Integration {
  id: string;
  org_id: string;
  type: 'notion' | 'freshdesk' | 'freshchat' | 'stripe' | 'looker' | 'custom';
  name: string;
  config: Record<string, any>;
  status: 'active' | 'inactive' | 'error';
  last_sync?: string;
  created_at: string;
  updated_at: string;
}

// Notion sync configuration
export interface NotionSync {
  id: string;
  org_id: string;
  integration_id: string;
  notion_database_id: string;
  schema_id?: string;
  field_mapping?: Record<string, string>;
  sync_direction: 'one-way' | 'bi';
  last_sync?: string;
  created_at: string;
  updated_at: string;
}

// Freshdesk ticket mapping
export interface FreshdeskTicket {
  id: string;
  org_id: string;
  freshdesk_ticket_id: string;
  schema_id?: string;
  record_id?: string;
  status: string;
  synced_at?: string;
  created_at: string;
}

// Subscription/Billing
export interface Subscription {
  id: string;
  org_id: string;
  stripe_customer_id: string;
  stripe_subscription_id?: string;
  plan_id: string;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid';
  current_period_start?: string;
  current_period_end?: string;
  cancel_at?: string;
  created_at: string;
  updated_at: string;
}

// Real-time collaboration
export interface CollaborationSession {
  id: string;
  schema_id: string;
  user_id: string;
  cursor_position?: Record<string, any>;
  session_token: string;
  last_heartbeat: string;
  created_at: string;
}

// Change event for real-time sync
export interface ChangeEvent {
  id: string;
  org_id: string;
  schema_id?: string;
  record_id?: string;
  event_type: 'created' | 'updated' | 'deleted';
  changes?: Record<string, any>;
  user_id?: string;
  created_at: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// Pagination
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  meta?: PaginationMeta;
}
