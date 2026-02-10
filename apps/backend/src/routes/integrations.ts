import express, { Response, Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../server';
import { AuthRequest } from '../types';

const router = Router();

// Get all integrations for tenant
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: integrations, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('tenant_id', req.tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ data: integrations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get integration by type
router.get('/:type', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: integration, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('tenant_id', req.tenantId)
      .eq('integration_type', req.params.type)
      .single();

    if (error) throw error;
    res.json({ data: integration });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update integration
router.post('/:type', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.tenantId || !req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { config } = req.body;
    const type = req.params.type;

    if (!config) {
      return res.status(400).json({ error: 'Missing config' });
    }

    // Check if integration exists
    const { data: existing } = await supabase
      .from('integrations')
      .select('id')
      .eq('tenant_id', req.tenantId)
      .eq('integration_type', type)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('integrations')
        .update({
          config,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) throw error;
      res.json({ data: existing });
    } else {
      // Create new
      const integrationId = uuidv4();
      const { error } = await supabase.from('integrations').insert({
        id: integrationId,
        tenant_id: req.tenantId,
        integration_type: type,
        config,
        created_by: req.user.id,
      });

      if (error) throw error;
      res.json({ data: { id: integrationId, integration_type: type } });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Sync Notion integration
router.post('/notion/sync', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: integration } = await supabase
      .from('integrations')
      .select('*')
      .eq('tenant_id', req.tenantId)
      .eq('integration_type', 'notion')
      .single();

    if (!integration) {
      return res.status(400).json({ error: 'Notion integration not configured' });
    }

    // Call Notion API to fetch pages
    // This would use notion-sdk
    const apiKey = integration.config.api_key;

    // Mock sync response
    const syncedPages = await syncNotionPages(apiKey, req.tenantId);

    // Update last sync time
    await supabase
      .from('integrations')
      .update({ last_sync: new Date().toISOString() })
      .eq('id', integration.id);

    res.json({ data: syncedPages, message: 'Notion sync complete' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Freshdesk tickets
router.get('/freshdesk/tickets', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: integration } = await supabase
      .from('integrations')
      .select('*')
      .eq('tenant_id', req.tenantId)
      .eq('integration_type', 'freshdesk')
      .single();

    if (!integration) {
      return res.status(400).json({ error: 'Freshdesk integration not configured' });
    }

    // This would use node-freshdesk
    const tickets = await getFreshdeskTickets(integration.config);

    res.json({ data: tickets });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete integration
router.delete('/:type', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('tenant_id', req.tenantId)
      .eq('integration_type', req.params.type);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
async function syncNotionPages(apiKey: string, tenantId: string) {
  // TODO: Implement actual Notion API integration
  // Import notion-sdk and fetch pages
  return [
    {
      id: '1',
      title: 'Sample Page',
      url: 'https://notion.so/sample',
      syncedAt: new Date().toISOString(),
    },
  ];
}

async function getFreshdeskTickets(config: Record<string, any>) {
  // TODO: Implement actual Freshdesk API integration
  // Import node-freshdesk and fetch tickets
  return [
    {
      id: '1',
      subject: 'Sample Ticket',
      status: 'open',
      priority: 1,
    },
  ];
}

export default router;
