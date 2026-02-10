'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { schemaAPI, getAuthToken } from '@/lib/api-client';
import { SchemaModule } from '@shared/types';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Database } from 'lucide-react';
import Link from 'next/link';

export default function SchemasPage() {
  const router = useRouter();
  const [modules, setModules] = useState<SchemaModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    table_name: '',
    description: '',
  });

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadModules();
  }, [router]);

  async function loadModules() {
    try {
      const response = await schemaAPI.getModules();
      setModules(response.data);
    } catch (error: any) {
      toast.error('Failed to load schemas');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await schemaAPI.createModule({
        ...formData,
        module_type: 'main',
        fields: [],
      });
      toast.success('Schema created successfully');
      setFormData({ name: '', table_name: '', description: '' });
      setShowForm(false);
      loadModules();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure?')) return;
    try {
      await schemaAPI.deleteModule(id);
      toast.success('Schema deleted');
      loadModules();
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
          <h1 className="text-3xl font-bold">Schema Builder</h1>
          <p className="text-muted-foreground mt-2">Create and manage data schemas</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Schema
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <h2 className="text-lg font-semibold">Create New Schema</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Schema Name</label>
                <Input
                  placeholder="e.g., Customer"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Table Name</label>
                <Input
                  placeholder="e.g., customers"
                  value={formData.table_name}
                  onChange={(e) => setFormData({ ...formData, table_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create Schema</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Database className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No schemas created yet</p>
          </div>
        ) : (
          modules.map((module) => (
            <Card key={module.id} className="p-6 flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div>
                <h3 className="text-lg font-semibold">{module.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{module.description || 'No description'}</p>
                <p className="text-xs text-muted-foreground mt-4">Table: {module.table_name}</p>
              </div>
              <div className="flex gap-2 mt-6">
                <Link href={`/schemas/${module.id}`} className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(module.id)}
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
