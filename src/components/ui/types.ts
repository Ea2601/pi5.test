export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface InteractiveProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export type ComponentSize = 'sm' | 'md' | 'lg';
export type ComponentVariant = 'default' | 'outline' | 'ghost' | 'destructive';
export type ComponentStatus = 'ok' | 'warn' | 'error';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: ComponentStatus;
  isDragging?: boolean;
}

export interface UIControl {
  id: string;
  type: 'toggle' | 'slider' | 'select' | 'input' | 'button';
  label: string;
  value?: any;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string; label: string }>;
  action?: (value: any) => void;
  icon?: string;
}