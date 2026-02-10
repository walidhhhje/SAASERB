import type { QueryBuilderValue, QueryRule } from '@shared/types';

export function buildQuerySQL(query: QueryBuilderValue): string {
  const baseSelect = `SELECT data FROM erb_records WHERE org_id = $1`;
  const whereClause = buildWhereClause(query.rules);

  if (!whereClause) {
    return baseSelect;
  }

  return `${baseSelect} AND ${whereClause}`;
}

function buildWhereClause(rules: QueryRule[], combinator: string = 'AND'): string {
  if (!rules || rules.length === 0) return '';

  const clauses = rules
    .map((rule) => {
      if (rule.rules && rule.rules.length > 0) {
        return `(${buildWhereClause(rule.rules, rule.combinator || 'AND')})`;
      }

      if (!rule.field || !rule.operator) return '';

      return buildCondition(rule.field, rule.operator, rule.value);
    })
    .filter(Boolean);

  return clauses.join(` ${combinator} `);
}

function buildCondition(field: string, operator: string, value: any): string {
  const fieldPath = `data->>'${field}'`;

  switch (operator) {
    case 'equals':
      return `${fieldPath} = '${escapeSQL(value)}'`;
    case 'notEquals':
      return `${fieldPath} != '${escapeSQL(value)}'`;
    case 'contains':
      return `${fieldPath} ILIKE '%${escapeSQL(value)}%'`;
    case 'notContains':
      return `${fieldPath} NOT ILIKE '%${escapeSQL(value)}%'`;
    case 'beginsWith':
      return `${fieldPath} ILIKE '${escapeSQL(value)}%'`;
    case 'endsWith':
      return `${fieldPath} ILIKE '%${escapeSQL(value)}'`;
    case 'greaterThan':
      return `CAST(${fieldPath} AS NUMERIC) > ${value}`;
    case 'lessThan':
      return `CAST(${fieldPath} AS NUMERIC) < ${value}`;
    case 'greaterThanOrEqual':
      return `CAST(${fieldPath} AS NUMERIC) >= ${value}`;
    case 'lessThanOrEqual':
      return `CAST(${fieldPath} AS NUMERIC) <= ${value}`;
    case 'in':
      const values = Array.isArray(value)
        ? value.map((v) => `'${escapeSQL(v)}'`).join(',')
        : `'${escapeSQL(value)}'`;
      return `${fieldPath} IN (${values})`;
    case 'notIn':
      const notInValues = Array.isArray(value)
        ? value.map((v) => `'${escapeSQL(v)}'`).join(',')
        : `'${escapeSQL(value)}'`;
      return `${fieldPath} NOT IN (${notInValues})`;
    case 'isEmpty':
      return `${fieldPath} IS NULL OR ${fieldPath} = ''`;
    case 'isNotEmpty':
      return `${fieldPath} IS NOT NULL AND ${fieldPath} != ''`;
    default:
      return '';
  }
}

function escapeSQL(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/'/g, "''");
}
