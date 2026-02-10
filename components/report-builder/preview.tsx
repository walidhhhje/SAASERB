'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { QueryBuilderValue } from '@shared/types';

const MOCK_DATA = [
  { name: 'Jan', value: 400, count: 24 },
  { name: 'Feb', value: 300, count: 13 },
  { name: 'Mar', value: 200, count: 9 },
  { name: 'Apr', value: 278, count: 39 },
  { name: 'May', value: 189, count: 22 },
  { name: 'Jun', value: 239, count: 29 },
];

interface ReportPreviewProps {
  visualizationType: string;
  query: QueryBuilderValue;
}

export default function ReportPreview({ visualizationType, query }: ReportPreviewProps) {
  const [data] = useState(MOCK_DATA);

  if (visualizationType === 'table') {
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.name}</TableCell>
                <TableCell className="text-right">{row.value}</TableCell>
                <TableCell className="text-right">{row.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (visualizationType === 'chart') {
    return (
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3b82f6" />
            <Bar dataKey="count" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (visualizationType === 'map') {
    return (
      <div className="h-80 w-full bg-muted/50 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Map visualization coming soon</p>
      </div>
    );
  }

  if (visualizationType === 'timeline') {
    return (
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" />
            <Line type="monotone" dataKey="count" stroke="#10b981" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return <div>Unknown visualization type</div>;
}
