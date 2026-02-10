'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { integrationAPI, getAuthToken } from '@/lib/api-client';
import { Integration } from '@shared/types';
import { toast } from 'sonner';
import { Zap, Trash2, RefreshCw, CheckCircle, Circle } from 'lucide-react';

const INTEGRATION_TYPES = [
  { id: 'notion', name: 'Notion', icon: '📄' },
  { id: 'freshdesk', name: 'Freshdesk', icon: '🎫' },
  { id: 'freshchat', name: 'Freshchat', icon: '💬' },
];

export default function IntegrationsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [config, setConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadIntegrations();
  }, [router]);

  async function loadIntegrations() {
    try {
      const response = await integrationAPI.getIntegrations();
      setIntegrations(response.data);
    } catch (error: any) {
      toast.error('Failed to load integrations');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave(type: string) {
    try {
      await integrationAPI.createIntegration(type, config);
      toast.success(`${type} integration saved`);
      setEditingId(null);
      setConfig({});
      loadIntegrations();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function handleSync(type: string) {
    try {
      if (type === 'notion') {
        await integrationAPI.syncNotion();
      } else if (type === 'freshdesk') {
        await integrationAPI.getFreshdeskTickets();
      }
      toast.success(`${type} sync completed`);
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function handleDelete(id: string, type: string) {
    if (!confirm('Are you sure?')) return;
    try {
      await integrationAPI.deleteIntegration(type);
      toast.success('Integration deleted');
      loadIntegrations();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getIntegration = (type: string) => integrations.find((i) => i.integration_type === type);

  return (
    <div className="space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">Connect with external services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INTEGRATION_TYPES.map((integration) => {
          const configured = getIntegration(integration.id);
          const isEditing = editingId === integration.id;

          return (
            <Card key={integration.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <h3 className="font-semibold">{integration.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      {configured ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Connected
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4" />
                          Not connected
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="space-y-3 mb-4">
                  {integration.id === 'notion' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">API Key</label>
                      <Input
                        placeholder="notion_..."
                        value={config.api_key || ''}
                        onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
                      />
                    </div>
                  )}
                  {integration.id === 'freshdesk' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">API Key</label>
                        <Input
                          placeholder="Your API key"
                          value={config.api_key || ''}
                          onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Domain</label>
                        <Input
                          placeholder="your-domain"
                          value={config.domain || ''}
                          onChange={(e) => setConfig({ ...config, domain: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button
                      size="sm"
                      variant={configured ? 'outline' : 'default'}
                      onClick={() => {
                        setEditingId(integration.id);
                        if (configured) {
                          setConfig(configured.config);
                        }
                      }}
                      className="flex-1"
                    >
                      {configured ? 'Edit' : 'Connect'}
                    </Button>
                    {configured && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSync(integration.id)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(configured.id, integration.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleSave(integration.id)}
                      className="flex-1"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        setConfig({});
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
