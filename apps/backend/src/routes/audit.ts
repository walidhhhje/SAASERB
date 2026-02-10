import express, { Request, Response, Router } from 'express';
import { supabase } from '../server';
import { AuthRequest } from '../types';

const router = Router();

// Get audit logs for tenant
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { entityType, entityId, page = '1', limit = '50' } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('tenant_id', req.tenantId);

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    if (entityId) {
      query = query.eq('entity_id', entityId);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    res.json({
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        hasMore: offset + limitNum < (count || 0),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get audit log by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('id', req.params.id)
      .eq('tenant_id', req.tenantId)
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create audit log (internal helper, called from other routes)
export async function createAuditLog(
  tenantId: string,
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  changes?: Record<string, unknown>
) {
  try {
    const { error } = await supabase.from('audit_logs').insert({
      tenant_id: tenantId,
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      changes,
    });

    if (error) console.error('Audit log creation error:', error);
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

export default router;
