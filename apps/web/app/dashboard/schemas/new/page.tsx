'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/components/layout/dashboard-layout';
import SchemaFieldBuilder from '@/components/schema-builder/field-builder';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { SchemaField, SchemaDefinition } from '@shared/types';

export default function CreateSchemaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });
  const [fields, setFields] = useState<SchemaField[]>([
    {
      id: '1',
      name: 'title',
      type: 'text',
      required: true,
      unique: false,
    },
  ]);

  const handleAddField = () => {
    const newField: SchemaField = {
      id: String(Date.now()),
      name: `field_${fields.length}`,
      type: 'text',
      required: false,
      unique: false,
    };
    setFields([...fields, newField]);
  };

  const handleUpdateField = (index: number, field: SchemaField) => {
    const newFields = [...fields];
    newFields[index] = field;
    setFields(newFields);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (fields.length === 0) {
      toast.error('Add at least one field');
      return;
    }

    setIsLoading(true);

    try {
      const definition: SchemaDefinition = {
        fields,
        relations: [],
        indexes: [],
      };

      const token = localStorage.getItem('supabase-token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schemas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          definition,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Failed to create schema');
      }

      const data = await res.json();
      toast.success('Schema created successfully');
      router.push(`/dashboard/schemas/${data.data.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create schema');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Schema</h1>
          <p className="text-muted-foreground mt-2">Define your data structure with drag-and-drop</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Schema Information</CardTitle>
              <CardDescription>Basic details about your schema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name*</Label>
                <Input
                  id="name"
                  placeholder="e.g., Customer"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({
                      ...formData,
                      name,
                      slug: name.toLowerCase().replace(/\s+/g, '_'),
                    });
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug*</Label>
                <Input
                  id="slug"
                  placeholder="e.g., customer"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this schema is for..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Fields */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Fields</CardTitle>
                <CardDescription>Define the fields for your schema</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddField}
              >
                Add Field
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <SchemaFieldBuilder
                    key={field.id}
                    field={field}
                    index={index}
                    onUpdate={(updated) => handleUpdateField(index, updated)}
                    onRemove={() => handleRemoveField(index)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Schema'}
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
