export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
}

export interface CardSpec {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  data?: any;
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