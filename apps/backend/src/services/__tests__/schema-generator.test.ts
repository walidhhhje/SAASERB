import { describe, it, expect } from 'vitest';
import { generateTableSchema, generateFieldSQL } from '../schema-generator';
import type { SchemaDefinition, SchemaField } from '@shared/types';

describe('Schema Generator', () => {
  describe('generateTableSchema', () => {
    it('should generate a valid PostgreSQL table creation statement', () => {
      const definition: SchemaDefinition = {
        fields: [
          {
            id: '1',
            name: 'name',
            type: 'text',
            required: true,
            unique: false,
          },
          {
            id: '2',
            name: 'email',
            type: 'email',
            required: true,
            unique: true,
          },
        ],
        relations: [],
        indexes: [],
      };

      const { tableName, sqlDefinition } = generateTableSchema('Customer', definition);

      expect(tableName).toBe('customer');
      expect(sqlDefinition).toContain('CREATE TABLE IF NOT EXISTS customer');
      expect(sqlDefinition).toContain('id UUID PRIMARY KEY');
      expect(sqlDefinition).toContain('org_id UUID REFERENCES organizations(id)');
      expect(sqlDefinition).toContain('ALTER TABLE customer ENABLE ROW LEVEL SECURITY');
    });

    it('should handle special characters in schema names', () => {
      const definition: SchemaDefinition = {
        fields: [],
        relations: [],
        indexes: [],
      };

      const { tableName } = generateTableSchema('Customer Profile', definition);

      expect(tableName).toBe('customer_profile');
    });
  });

  describe('generateFieldSQL', () => {
    it('should generate SQL for text field', () => {
      const field: SchemaField = {
        id: '1',
        name: 'title',
        type: 'text',
        required: true,
        unique: false,
      };

      const sql = generateFieldSQL(field);
      expect(sql).toContain('title TEXT NOT NULL');
    });

    it('should generate SQL for number field', () => {
      const field: SchemaField = {
        id: '1',
        name: 'quantity',
        type: 'number',
        required: false,
        unique: false,
      };

      const sql = generateFieldSQL(field);
      expect(sql).toContain('quantity NUMERIC');
    });

    it('should handle unique constraint', () => {
      const field: SchemaField = {
        id: '1',
        name: 'email',
        type: 'email',
        required: true,
        unique: true,
      };

      const sql = generateFieldSQL(field);
      expect(sql).toContain('UNIQUE');
    });

    it('should handle default values', () => {
      const field: SchemaField = {
        id: '1',
        name: 'status',
        type: 'text',
        required: false,
        unique: false,
        defaultValue: 'active',
      };

      const sql = generateFieldSQL(field);
      expect(sql).toContain("DEFAULT 'active'");
    });
  });
});
