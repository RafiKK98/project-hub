import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS class names safely, resolving conflicts.
 * Used by all shadcn/ui components and throughout the app.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
