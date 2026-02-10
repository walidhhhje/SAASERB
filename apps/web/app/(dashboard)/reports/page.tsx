'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { reportAPI, getAuthToken } from '@/lib/api-client';
import { Report } from '@shared/types';
import { toast } from 'sonner';
import { Plus, Trash2, Eye, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadReports();
  }, [router]);

  async function loadReports() {
    try {
      const response = await reportAPI.getReports();
      setReports(response.data);
    } catch (error: any) {
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure?')) return;
    try {
      await reportAPI.deleteReport(id);
      toast.success('Report deleted');
      loadReports();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function handleExecute(id: string) {
    try {
      await reportAPI.executeReport(id);
      toast.success('Report executed');
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

  return (
    <div className="space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-2">Create and manage your reports</p>
        </div>
        <Link href="/reports/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No reports created yet</p>
          </div>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="p-6 flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div>
                <h3 className="text-lg font-semibold">{report.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{report.description || 'No description'}</p>
                <div className="mt-4 flex items-center gap-2">
                  {report.is_shared && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Shared
                    </span>
                  )}
                  {report.chart_config && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Visualized
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Link href={`/reports/${report.id}`} className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  onClick={() => handleExecute(report.id)}
                >
                  Execute
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(report.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
