import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../index';

const router = Router();

// Get records for a schema
router.get('/:schemaId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { data, count, error } = await supabase
      .from('erb_records')
      .select('*', { count: 'exact' })
      .eq('schema_id', req.params.schemaId)
      .eq('org_id', req.user!.org_id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (error) throw error;

    res.json({
      success: true,
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        hasMore: offset + Number(limit) < (count || 0),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create record
router.post('/:schemaId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: recordData, moduleType = 'main', parentId } = req.body;

    const { data: record, error } = await supabase
      .from('erb_records')
      .insert({
        schema_id: req.params.schemaId,
        org_id: req.user!.org_id,
        tenant_id: req.user!.org_id,
        module_type: moduleType,
        parent_id: parentId,
        data: recordData,
        created_by: req.user!.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Log audit
    await supabase.from('audit_logs').insert({
      org_id: req.user!.org_id,
      user_id: req.user!.id,
      entity_type: 'record',
      entity_id: record.id,
      action: 'create',
      changes: { data: recordData },
    });

    // Broadcast change event
    await supabase.from('change_events').insert({
      org_id: req.user!.org_id,
      schema_id: req.params.schemaId,
      record_id: record.id,
      event_type: 'created',
      changes: { data: recordData },
      user_id: req.user!.id,
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
});

// Update record
router.put('/:recordId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: updateData } = req.body;

    const { data: record, error: getError } = await supabase
      .from('erb_records')
      .select('*')
      .eq('id', req.params.recordId)
      .eq('org_id', req.user!.org_id)
      .single();

    if (getError) throw getError;
    if (!record) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Record not found' },
      });
    }

    const { data: updated, error: updateError } = await supabase
      .from('erb_records')
      .update({
        data: updateData,
        version: record.version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.recordId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log audit
    await supabase.from('audit_logs').insert({
      org_id: req.user!.org_id,
      user_id: req.user!.id,
      entity_type: 'record',
      entity_id: record.id,
      action: 'update',
      changes: { before: record.data, after: updateData },
    });

    // Broadcast change event
    await supabase.from('change_events').insert({
      org_id: req.user!.org_id,
      schema_id: record.schema_id,
      record_id: record.id,
      event_type: 'updated',
      changes: { before: record.data, after: updateData },
      user_id: req.user!.id,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// Delete record (soft delete)
router.delete('/:recordId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: record, error: getError } = await supabase
      .from('erb_records')
      .select('*')
      .eq('id', req.params.recordId)
      .eq('org_id', req.user!.org_id)
      .single();

    if (getError) throw getError;
    if (!record) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Record not found' },
      });
    }

    const { error: deleteError } = await supabase
      .from('erb_records')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', req.params.recordId);

    if (deleteError) throw deleteError;

    // Log audit
    await supabase.from('audit_logs').insert({
      org_id: req.user!.org_id,
      user_id: req.user!.id,
      entity_type: 'record',
      entity_id: record.id,
      action: 'delete',
    });

    // Broadcast change event
    await supabase.from('change_events').insert({
      org_id: req.user!.org_id,
      schema_id: record.schema_id,
      record_id: record.id,
      event_type: 'deleted',
      user_id: req.user!.id,
    });

    res.json({ success: true, message: 'Record deleted' });
  } catch (error) {
    next(error);
  }
});

// Bulk export records as CSV
router.get('/:schemaId/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('erb_records')
      .select('*')
      .eq('schema_id', req.params.schemaId)
      .eq('org_id', req.user!.org_id)
      .eq('is_deleted', false);

    if (error) throw error;

    // Convert to CSV
    const csv = convertToCSV(data);
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="export.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csv = [headers.join(',')];

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value).includes(',') ? `"${value}"` : value;
    });
    csv.push(values.join(','));
  }

  return csv.join('\n');
}

export default router;
