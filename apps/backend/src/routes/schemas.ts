import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../index';
import { generateTableSchema } from '../services/schema-generator';
import type { ERBSchema, SchemaDefinition } from '@shared/types';

const router = Router();

// Get all schemas for organization
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('erb_schemas')
      .select('*')
      .eq('org_id', req.user!.org_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// Get single schema
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('erb_schemas')
      .select('*')
      .eq('id', req.params.id)
      .eq('org_id', req.user!.org_id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Schema not found' },
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// Create schema
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, description, definition } = req.body as {
      name: string;
      slug: string;
      description?: string;
      definition: SchemaDefinition;
    };

    if (!name || !slug || !definition) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Missing required fields' },
      });
    }

    // Generate table schema and SQL
    const { tableName, sqlDefinition } = generateTableSchema(name, definition);

    // Create schema record
    const { data: schema, error: schemaError } = await supabase
      .from('erb_schemas')
      .insert({
        org_id: req.user!.org_id,
        name,
        slug,
        description,
        definition,
        table_name: tableName,
        created_by: req.user!.id,
        status: 'draft',
      })
      .select()
      .single();

    if (schemaError) throw schemaError;

    // Log audit
    await supabase.from('audit_logs').insert({
      org_id: req.user!.org_id,
      user_id: req.user!.id,
      entity_type: 'schema',
      entity_id: schema.id,
      action: 'create',
      changes: { definition },
    });

    res.status(201).json({ success: true, data: schema });
  } catch (error) {
    next(error);
  }
});

// Update schema
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, definition, status } = req.body;

    const { data: schema, error: getError } = await supabase
      .from('erb_schemas')
      .select('*')
      .eq('id', req.params.id)
      .eq('org_id', req.user!.org_id)
      .single();

    if (getError) throw getError;
    if (!schema) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Schema not found' },
      });
    }

    const { data: updated, error: updateError } = await supabase
      .from('erb_schemas')
      .update({ name, description, definition, status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log audit
    await supabase.from('audit_logs').insert({
      org_id: req.user!.org_id,
      user_id: req.user!.id,
      entity_type: 'schema',
      entity_id: schema.id,
      action: 'update',
      changes: { before: schema, after: updated },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// Publish schema (creates actual database table)
router.post('/:id/publish', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: schema, error: getError } = await supabase
      .from('erb_schemas')
      .select('*')
      .eq('id', req.params.id)
      .eq('org_id', req.user!.org_id)
      .single();

    if (getError) throw getError;
    if (!schema) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Schema not found' },
      });
    }

    // Generate and execute SQL to create actual table
    const { sqlDefinition } = generateTableSchema(schema.name, schema.definition);

    // Execute SQL via Supabase admin client
    const { error: sqlError } = await supabase.rpc('exec_sql', {
      sql: sqlDefinition,
    });

    if (sqlError) {
      console.error('SQL execution error:', sqlError);
      // Continue even if table creation fails - it might already exist
    }

    const { data: updated, error: updateError } = await supabase
      .from('erb_schemas')
      .update({ status: 'published', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log audit
    await supabase.from('audit_logs').insert({
      org_id: req.user!.org_id,
      user_id: req.user!.id,
      entity_type: 'schema',
      entity_id: schema.id,
      action: 'publish',
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// Delete schema
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: schema, error: getError } = await supabase
      .from('erb_schemas')
      .select('*')
      .eq('id', req.params.id)
      .eq('org_id', req.user!.org_id)
      .single();

    if (getError) throw getError;
    if (!schema) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Schema not found' },
      });
    }

    // Only allow deletion of draft schemas
    if (schema.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Can only delete draft schemas' },
      });
    }

    const { error: deleteError } = await supabase
      .from('erb_schemas')
      .update({ status: 'archived' })
      .eq('id', req.params.id);

    if (deleteError) throw deleteError;

    // Log audit
    await supabase.from('audit_logs').insert({
      org_id: req.user!.org_id,
      user_id: req.user!.id,
      entity_type: 'schema',
      entity_id: schema.id,
      action: 'delete',
    });

    res.json({ success: true, message: 'Schema archived' });
  } catch (error) {
    next(error);
  }
});

export default router;
