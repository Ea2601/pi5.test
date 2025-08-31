import React from 'react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableCardProps {
  title: string;
  columns: Column[];
  data: any[];
  isDragging?: boolean;
}

export const TableCard: React.FC<TableCardProps> = ({
  title,
  columns = [], // Default to empty array
  data = [], // Default to empty array
  isDragging
}) => {
  // Ensure columns and data are valid arrays
  const validColumns = Array.isArray(columns) ? columns : [];
  const validData = Array.isArray(data) ? data : [];

  return (
    <Card title={title} isDragging={isDragging} className="h-full">
      <div className="overflow-x-auto">
        {validColumns.length === 0 ? (
          <div className="text-center py-8 text-white/50">
            Henüz veri bulunmuyor
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {validColumns.map((column) => (
                  <th key={column.key} className="text-left py-3 px-2 text-white/80 font-medium text-sm">
                    {column.label || ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {validData.length === 0 ? (
                <tr>
                  <td colSpan={validColumns.length} className="text-center py-8 text-white/50">
                    Henüz veri bulunmuyor
                  </td>
                </tr>
              ) : (
                validData.map((row, index) => (
                  <tr key={row?.id || `row-${index}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    {validColumns.map((column) => (
                      <td key={column.key} className="py-3 px-2 text-white text-sm">
                        {column.render 
                          ? column.render(row?.[column.key], row) 
                          : (row?.[column.key] || '')
                        }
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
};