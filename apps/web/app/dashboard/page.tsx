'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { toast } from 'sonner';
import { Plus, Database, BarChart3, Zap } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [schemas, setSchemas] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch schemas
      const schemasRes = await fetch('/api/schemas', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('supabase-token')}`,
        },
      });
      if (schemasRes.ok) {
        const data = await schemasRes.json();
        setSchemas(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome back, {user?.full_name || user?.email}</p>
          </div>
          <Link href="/dashboard/schemas/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Schema
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Schemas</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schemas.length}</div>
              <p className="text-xs text-muted-foreground">Data structures created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">Reports generated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Integrations</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Integrations active</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Schemas */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Schemas</CardTitle>
            <CardDescription>Your most recently created data structures</CardDescription>
          </CardHeader>
          <CardContent>
            {schemas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No schemas yet. Create one to get started.</p>
                <Link href="/dashboard/schemas/new">
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Schema
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {schemas.slice(0, 5).map((schema) => (
                  <Link
                    key={schema.id}
                    href={`/dashboard/schemas/${schema.id}`}
                    className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <h3 className="font-semibold">{schema.name}</h3>
                    <p className="text-sm text-muted-foreground">{schema.description}</p>
                    <div className="text-xs text-muted-foreground mt-2">
                      Status: <span className="font-medium capitalize">{schema.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
