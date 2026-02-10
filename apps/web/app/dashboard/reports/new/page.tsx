'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DashboardLayout from '@/components/layout/dashboard-layout';
import ReportQueryBuilder from '@/components/report-builder/query-builder';
import ReportPreview from '@/components/report-builder/preview';
import { toast } from 'sonner';
import type { QueryBuilderValue } from '@shared/types';

const CHART_TYPES = [
  { value: 'table', label: 'Table' },
  { value: 'chart', label: 'Chart' },
  { value: 'map', label: 'Map' },
  { value: 'timeline', label: 'Timeline' },
];

export default function CreateReportPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('query');

  const [formData, setFormData] = useState({
    name: '',
    schemaId: '',
    visualizationType: 'table',
    description: '',
  });

  const [query, setQuery] = useState<QueryBuilderValue>({
    combinator: 'and',
    rules: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.schemaId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('supabase-token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          schemaId: formData.schemaId,
          query,
          visualizationType: formData.visualizationType,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Failed to create report');
      }

      const data = await res.json();
      toast.success('Report created successfully');
      router.push(`/dashboard/reports/${data.data.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create report');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Report</h1>
          <p className="text-muted-foreground mt-2">Build custom reports with query builder</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Report Info */}
          <Card>
            <CardHeader>
              <CardTitle>Report Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Report Name*</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Customer Sales Report"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visualization">Visualization Type</Label>
                  <Select
                    value={formData.visualizationType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, visualizationType: value })
                    }
                  >
                    <SelectTrigger id="visualization">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHART_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="schema">Data Source (Schema)*</Label>
                  <Select value={formData.schemaId} onValueChange={(value) =>
                    setFormData({ ...formData, schemaId: value })
                  }>
                    <SelectTrigger id="schema">
                      <SelectValue placeholder="Select a schema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="schema-1">Sample Schema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Query Builder */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="query">Query Builder</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="query" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Query Builder</CardTitle>
                  <CardDescription>Define your report query</CardDescription>
                </CardHeader>
                <CardContent>
                  <ReportQueryBuilder query={query} onChange={setQuery} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>See how your report will look</CardDescription>
                </CardHeader>
                <CardContent>
                  <ReportPreview
                    visualizationType={formData.visualizationType}
                    query={query}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Report'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
