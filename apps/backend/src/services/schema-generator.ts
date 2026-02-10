import type { SchemaDefinition, SchemaField } from '@shared/types';

export function generateTableSchema(
  schemaName: string,
  definition: SchemaDefinition
): { tableName: string; sqlDefinition: string } {
  const tableName = schemaName.toLowerCase().replace(/\s+/g, '_');
  const fields = definition.fields || [];

  let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
  sql += `  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n`;
  sql += `  schema_id UUID REFERENCES erb_schemas(id),\n`;
  sql += `  org_id UUID REFERENCES organizations(id),\n`;
  sql += `  tenant_id UUID DEFAULT org_id,\n`;
  sql += `  data JSONB NOT NULL,\n`;
  sql += `  version INT DEFAULT 1,\n`;
  sql += `  is_deleted BOOLEAN DEFAULT FALSE,\n`;
  sql += `  created_by UUID REFERENCES auth_users(id),\n`;
  sql += `  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),\n`;
  sql += `  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())\n`;
  sql += `);\n`;

  // Add indexes
  sql += `CREATE INDEX IF NOT EXISTS idx_${tableName}_org_id ON ${tableName}(org_id);\n`;
  sql += `CREATE INDEX IF NOT EXISTS idx_${tableName}_created_at ON ${tableName}(created_at);\n`;

  // Add RLS
  sql += `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;\n`;
  sql += `CREATE POLICY "${tableName}_org_isolation" ON ${tableName}\n`;
  sql += `  USING (org_id IN (SELECT org_id FROM auth_users WHERE id = auth.uid()));\n`;

  return {
    tableName,
    sqlDefinition: sql,
  };
}

export function generateFieldSQL(field: SchemaField): string {
  let sql = `${field.name} `;

  switch (field.type) {
    case 'text':
      sql += 'TEXT';
      break;
    case 'number':
      sql += 'NUMERIC';
      break;
    case 'date':
      sql += 'DATE';
      break;
    case 'boolean':
      sql += 'BOOLEAN';
      break;
    case 'email':
      sql += 'TEXT';
      break;
    case 'url':
      sql += 'TEXT';
      break;
    case 'json':
      sql += 'JSONB';
      break;
    case 'select':
    case 'multiselect':
      sql += 'TEXT[]';
      break;
    default:
      sql += 'TEXT';
  }

  if (field.required) {
    sql += ' NOT NULL';
  }

  if (field.unique) {
    sql += ' UNIQUE';
  }

  if (field.defaultValue !== undefined) {
    sql += ` DEFAULT '${field.defaultValue}'`;
  }

  return sql;
}
