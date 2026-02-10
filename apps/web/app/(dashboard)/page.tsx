'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAuthToken } from '@/lib/api-client';
import Link from 'next/link';
import { Plus, BarChart3, Database, Zap } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold text-balance">Welcome to SaaS ERB</h1>
        <p className="text-muted-foreground mt-2">
          Build powerful reports and manage your enterprise data with ease.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold">Schema Builder</h2>
            </div>
            <p className="text-muted-foreground">
              Create and manage data schemas with drag-and-drop interface.
            </p>
          </div>
          <Link href="/schemas">
            <Button className="mt-6 w-full">
              <Plus className="w-4 h-4 mr-2" />
              Open Schema Builder
            </Button>
          </Link>
        </Card>

        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-semibold">Report Builder</h2>
            </div>
            <p className="text-muted-foreground">
              Create interactive reports with custom queries and visualizations.
            </p>
          </div>
          <Link href="/reports">
            <Button className="mt-6 w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create Report
            </Button>
          </Link>
        </Card>

        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-semibold">Integrations</h2>
            </div>
            <p className="text-muted-foreground">
              Connect with Notion, Freshdesk, and Looker Studio.
            </p>
          </div>
          <Link href="/integrations">
            <Button className="mt-6 w-full bg-transparent" variant="outline">
              Manage Integrations
            </Button>
          </Link>
        </Card>

        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-semibold">Analytics</h2>
            </div>
            <p className="text-muted-foreground">
              View audit logs and usage statistics.
            </p>
          </div>
          <Link href="/analytics">
            <Button className="mt-6 w-full bg-transparent" variant="outline">
              View Analytics
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
