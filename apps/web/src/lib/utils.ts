import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names safely, resolving conflicts.
 * Used by all shadcn/ui components and throughout the app.
 */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export { cn, getInitials };
