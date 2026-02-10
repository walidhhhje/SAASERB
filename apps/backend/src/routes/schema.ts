import express, { Response, Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../server';
import { AuthRequest } from '../types';

const router = Router();

// Get all modules for tenant
router.get('/modules', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: modules, error } = await supabase
      .from('schema_modules')
      .select('*')
      .eq('tenant_id', req.tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ data: modules });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get module by ID
router.get('/modules/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: module, error } = await supabase
      .from('schema_modules')
      .select('*')
      .eq('id', req.params.id)
      .eq('tenant_id', req.tenantId)
      .single();

    if (error) throw error;
    res.json({ data: module });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create module with table
router.post('/modules', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.tenantId || !req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { name, table_name, description, parent_module_id, module_type, fields } = req.body;

    if (!name || !table_name || !fields) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const moduleId = uuidv4();

    // Create module record
    const { error: moduleError } = await supabase
      .from('schema_modules')
      .insert({
        id: moduleId,
        tenant_id: req.tenantId,
        name,
        table_name,
        description,
        parent_module_id,
        module_type: module_type || 'main',
        fields,
        created_by: req.user.id,
      });

    if (moduleError) throw moduleError;

    // Create SQL migration to create the table
    const fieldDefinitions = fields
      .map((f: any) => {
        const baseType = mapFieldType(f.type);
        const constraints = [];
        if (f.required) constraints.push('NOT NULL');
        if (f.unique) constraints.push('UNIQUE');
        return `${f.name} ${baseType} ${constraints.join(' ')}`;
      })
      .join(',\n  ');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${table_name} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        ${fieldDefinitions},
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );

      CREATE INDEX idx_${table_name}_tenant ON ${table_name}(tenant_id);
      ALTER TABLE ${table_name} ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "${table_name}_tenant_isolation" ON ${table_name}
        USING (tenant_id = auth.uid()::text);
    `;

    // Execute SQL via Supabase
    const { error: sqlError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL,
    });

    if (sqlError) {
      console.error('SQL error:', sqlError);
      // Don't fail the module creation, just log the error
    }

    res.json({
      data: {
        id: moduleId,
        name,
        table_name,
      },
    });
  } catch (error: any) {
    console.error('Create module error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update module
router.put('/modules/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.tenantId || !req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { name, description, fields } = req.body;

    const { error } = await supabase
      .from('schema_modules')
      .update({
        name,
        description,
        fields,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('tenant_id', req.tenantId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete module
router.delete('/modules/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { error } = await supabase
      .from('schema_modules')
      .delete()
      .eq('id', req.params.id)
      .eq('tenant_id', req.tenantId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to map field types
function mapFieldType(type: string): string {
  const typeMap: Record<string, string> = {
    text: 'TEXT',
    number: 'NUMERIC',
    boolean: 'BOOLEAN',
    date: 'DATE',
    datetime: 'TIMESTAMP WITH TIME ZONE',
    select: 'TEXT',
    multiselect: 'TEXT[]',
    json: 'JSONB',
  };
  return typeMap[type] || 'TEXT';
}

export default router;
