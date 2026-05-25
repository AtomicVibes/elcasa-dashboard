import { type ClassValue, clsx } from 'clsx';

// Simple `cn` helper used by the UI components.
// This file exists to satisfy imports like `@/app/lib/utils`.
export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs);
}

