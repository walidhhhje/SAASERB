'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import type { QueryBuilderValue, QueryRule } from '@shared/types';

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'notContains', label: 'Not Contains' },
  { value: 'greaterThan', label: 'Greater Than' },
  { value: 'lessThan', label: 'Less Than' },
  { value: 'isEmpty', label: 'Is Empty' },
  { value: 'isNotEmpty', label: 'Is Not Empty' },
];

const FIELDS = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'created_at', label: 'Created At' },
  { value: 'status', label: 'Status' },
];

interface QueryBuilderProps {
  query: QueryBuilderValue;
  onChange: (query: QueryBuilderValue) => void;
}

export default function ReportQueryBuilder({ query, onChange }: QueryBuilderProps) {
  const addRule = () => {
    const newRule: QueryRule = {
      field: FIELDS[0].value,
      operator: OPERATORS[0].value,
      value: '',
    };
    onChange({
      ...query,
      rules: [...query.rules, newRule],
    });
  };

  const updateRule = (index: number, rule: QueryRule) => {
    const newRules = [...query.rules];
    newRules[index] = rule;
    onChange({ ...query, rules: newRules });
  };

  const removeRule = (index: number) => {
    onChange({
      ...query,
      rules: query.rules.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      {query.rules.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No rules yet. Add a rule to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {query.rules.map((rule, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-3">
                {index > 0 && (
                  <div className="text-sm font-medium text-muted-foreground">
                    {query.combinator === 'and' ? 'AND' : 'OR'}
                  </div>
                )}

                <Select
                  value={rule.field || ''}
                  onValueChange={(field) => updateRule(index, { ...rule, field })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELDS.map((field) => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={rule.operator || ''}
                  onValueChange={(operator) => updateRule(index, { ...rule, operator })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {!['isEmpty', 'isNotEmpty'].includes(rule.operator || '') && (
                  <Input
                    value={rule.value || ''}
                    onChange={(e) => updateRule(index, { ...rule, value: e.target.value })}
                    placeholder="Value"
                    className="flex-1"
                  />
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRule(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Button type="button" variant="outline" onClick={addRule} className="w-full bg-transparent">
        <Plus className="mr-2 h-4 w-4" />
        Add Rule
      </Button>
    </div>
  );
}
