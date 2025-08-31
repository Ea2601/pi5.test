import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card } from '../ui/Card';

interface ChartCardProps {
  title: string;
  data: Array<{ time: string; value: number; [key: string]: any }>;
  type?: 'line' | 'area';
  color?: string;
  isDragging?: boolean;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  data = [], // Default to empty array
  type = 'line',
  color = '#00A36C',
  isDragging
}) => {
  // Ensure data is valid array
  const chartData = Array.isArray(data) ? data : [];
  
  return (
    <Card title={title} isDragging={isDragging} className="h-full">
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={chartData}>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#e8fff6', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#e8fff6', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`${color}20`}
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#e8fff6', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#e8fff6', fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};