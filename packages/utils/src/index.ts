/**
 * Creates a type-safe sleep utility.
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Strips undefined values from an object (useful for API payloads).
 */
export const stripUndefined = <T extends Record<string, unknown>>(
  obj: T,
): Partial<T> =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;

/**
 * Generates a simple slug from a string.
 */
export const slugify = (str: string): string =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
