/**
 * Formats a date to ISO 8601 string.
 */
export function toISOString(date: Date = new Date()): string {
  return date.toISOString()
}

/**
 * Creates a type-safe sleep utility.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Strips undefined values from an object (useful for API payloads).
 */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>
}

/**
 * Generates a simple slug from a string.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
