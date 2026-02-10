import express, { Response, Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../server';
import { AuthRequest } from '../types';

const router = Router();

// Get all reports for tenant
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .eq('tenant_id', req.tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ data: reports });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get report by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: report, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', req.params.id)
      .eq('tenant_id', req.tenantId)
      .single();

    if (error) throw error;
    res.json({ data: report });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create report
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.tenantId || !req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { name, description, module_id, query_builder, chart_config, looker_studio_url, is_shared } =
      req.body;

    if (!name || !query_builder) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const reportId = uuidv4();

    const { error } = await supabase.from('reports').insert({
      id: reportId,
      tenant_id: req.tenantId,
      name,
      description,
      module_id,
      query_builder,
      chart_config,
      looker_studio_url,
      is_shared: is_shared || false,
      created_by: req.user.id,
    });

    if (error) throw error;

    res.json({
      data: {
        id: reportId,
        name,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update report
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, description, query_builder, chart_config, looker_studio_url, is_shared, shared_with } =
      req.body;

    const { error } = await supabase
      .from('reports')
      .update({
        name,
        description,
        query_builder,
        chart_config,
        looker_studio_url,
        is_shared,
        shared_with,
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

// Delete report
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', req.params.id)
      .eq('tenant_id', req.tenantId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Execute query from report
router.post('/:id/execute', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', req.params.id)
      .eq('tenant_id', req.tenantId)
      .single();

    if (reportError) throw reportError;

    // Build SQL query from query_builder
    const sql = buildSQLFromQueryBuilder(report.query_builder, report.module_id);

    // Execute query
    const { data, error } = await supabase.rpc('execute_query', {
      query_sql: sql,
    });

    if (error) throw error;

    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

function buildSQLFromQueryBuilder(queryBuilder: any, moduleId: string): string {
  // Simplified query builder to SQL conversion
  // In production, use a proper query builder library
  let sql = `SELECT * FROM module_${moduleId}`;

  if (queryBuilder.rules && queryBuilder.rules.length > 0) {
    const whereClause = buildWhereClause(queryBuilder.rules);
    sql += ` WHERE ${whereClause}`;
  }

  return sql;
}

function buildWhereClause(rules: any[]): string {
  return rules
    .map((rule) => {
      if (rule.rules) {
        return `(${buildWhereClause(rule.rules)})`;
      }
      const operator = mapOperator(rule.operator);
      return `${rule.field} ${operator} '${rule.value}'`;
    })
    .join(' AND ');
}

function mapOperator(op: string): string {
  const operatorMap: Record<string, string> = {
    equals: '=',
    not_equals: '!=',
    contains: 'ILIKE',
    not_contains: 'NOT ILIKE',
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
  };
  return operatorMap[op] || '=';
}

export default router;
