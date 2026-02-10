'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { X, GripVertical } from 'lucide-react';
import type { SchemaField } from '@shared/types';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'select', label: 'Select' },
  { value: 'multiselect', label: 'Multi-select' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'json', label: 'JSON' },
  { value: 'file', label: 'File' },
];

interface FieldBuilderProps {
  field: SchemaField;
  index: number;
  onUpdate: (field: SchemaField) => void;
  onRemove: () => void;
}

export default function SchemaFieldBuilder({
  field,
  index,
  onUpdate,
  onRemove,
}: FieldBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />

        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor={`field-name-${index}`} className="text-sm">
              Name
            </Label>
            <Input
              id={`field-name-${index}`}
              value={field.name}
              onChange={(e) => onUpdate({ ...field, name: e.target.value })}
              placeholder="Field name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`field-type-${index}`} className="text-sm">
              Type
            </Label>
            <Select value={field.type} onValueChange={(type: any) => onUpdate({ ...field, type })}>
              <SelectTrigger id={`field-type-${index}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`required-${index}`}
                checked={field.required}
                onCheckedChange={(checked) =>
                  onUpdate({ ...field, required: checked as boolean })
                }
              />
              <Label htmlFor={`required-${index}`} className="text-sm cursor-pointer">
                Required
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id={`unique-${index}`}
                checked={field.unique}
                onCheckedChange={(checked) =>
                  onUpdate({ ...field, unique: checked as boolean })
                }
              />
              <Label htmlFor={`unique-${index}`} className="text-sm cursor-pointer">
                Unique
              </Label>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`default-value-${index}`} className="text-sm">
              Default Value
            </Label>
            <Input
              id={`default-value-${index}`}
              value={field.defaultValue || ''}
              onChange={(e) => onUpdate({ ...field, defaultValue: e.target.value })}
              placeholder="Default value"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`description-${index}`} className="text-sm">
              Description
            </Label>
            <Input
              id={`description-${index}`}
              value={field.description || ''}
              onChange={(e) => onUpdate({ ...field, description: e.target.value })}
              placeholder="Field description"
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {isExpanded ? 'Hide' : 'Show'} advanced options
      </button>
    </Card>
  );
}
