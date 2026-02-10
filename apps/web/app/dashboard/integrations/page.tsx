'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { toast } from 'sonner';
import { Zap, RefreshCw, Trash2 } from 'lucide-react';

const INTEGRATIONS = [
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync Notion databases with your schemas',
    icon: '📝',
  },
  {
    id: 'freshdesk',
    name: 'Freshdesk',
    description: 'Integrate support tickets into your data',
    icon: '🎫',
  },
  {
    id: 'freshchat',
    name: 'Freshchat',
    description: 'Embedded customer chat widget',
    icon: '💬',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Manage subscriptions and billing',
    icon: '💳',
  },
  {
    id: 'looker',
    name: 'Looker Studio',
    description: 'Embed Looker dashboards in reports',
    icon: '📊',
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  const handleAddIntegration = async (integrationId: string) => {
    setSelectedIntegration(integrationId);
  };

  const handleSaveCredentials = async () => {
    if (!selectedIntegration || Object.keys(credentials).length === 0) {
      toast.error('Please fill in all credentials');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('supabase-token')}`,
        },
        body: JSON.stringify({
          type: selectedIntegration,
          name: selectedIntegration,
          config: credentials,
        }),
      });

      if (!response.ok) throw new Error('Failed to save integration');

      const data = await response.json();
      setIntegrations([...integrations, data.data]);
      setCredentials({});
      setSelectedIntegration(null);
      toast.success('Integration added successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add integration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (integrationId: string) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}/sync`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('supabase-token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to sync');
      toast.success('Integration synced successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sync integration');
    }
  };

  const handleDelete = async (integrationId: string) => {
    try {
      await fetch(`/api/integrations/${integrationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('supabase-token')}`,
        },
      });

      setIntegrations(integrations.filter((i) => i.id !== integrationId));
      toast.success('Integration deleted');
    } catch (error: any) {
      toast.error('Failed to delete integration');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground mt-2">Connect your tools and services</p>
        </div>

        <Tabs defaultValue="available" className="w-full">
          <TabsList>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="connected">Connected ({integrations.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {INTEGRATIONS.map((integration) => (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-4xl mb-2">{integration.icon}</div>
                        <CardTitle>{integration.name}</CardTitle>
                        <CardDescription>{integration.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleAddIntegration(integration.id)}
                      className="w-full"
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Connect
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="connected" className="space-y-4">
            {integrations.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No integrations connected yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <Card key={integration.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle>{integration.name}</CardTitle>
                        <CardDescription>Status: {integration.status}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSync(integration.id)}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Sync
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(integration.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    {integration.last_sync && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Last synced: {new Date(integration.last_sync).toLocaleString()}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Credentials Form */}
        {selectedIntegration && (
          <Card>
            <CardHeader>
              <CardTitle>
                Connect {INTEGRATIONS.find((i) => i.id === selectedIntegration)?.name}
              </CardTitle>
              <CardDescription>Enter your credentials below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  placeholder="Your API key"
                  value={credentials.apiKey || ''}
                  onChange={(e) =>
                    setCredentials({ ...credentials, apiKey: e.target.value })
                  }
                />
              </div>

              {selectedIntegration === 'freshdesk' && (
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    placeholder="your-domain.freshdesk.com"
                    value={credentials.domain || ''}
                    onChange={(e) =>
                      setCredentials({ ...credentials, domain: e.target.value })
                    }
                  />
                </div>
              )}

              {selectedIntegration === 'looker' && (
                <div className="space-y-2">
                  <Label htmlFor="embed-secret">Embed Secret</Label>
                  <Input
                    id="embed-secret"
                    placeholder="Your Looker embed secret"
                    value={credentials.embedSecret || ''}
                    onChange={(e) =>
                      setCredentials({ ...credentials, embedSecret: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSaveCredentials} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Integration'}
                </Button>
                <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
