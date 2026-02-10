import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    tenant_id?: string;
  };
  tenantId?: string;
}

export interface CreateSchemaModuleRequest {
  name: string;
  table_name: string;
  description?: string;
  parent_module_id?: string;
  module_type: 'main' | 'sub';
  fields: Array<{
    id: string;
    name: string;
    type: string;
    required: boolean;
    unique: boolean;
    defaultValue?: unknown;
    options?: string[];
  }>;
}
