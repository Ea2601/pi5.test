import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatBytes, formatUptime } from '../utils/formatters';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { formatBytes, formatUptime };