"use client";

import { useSessionSync } from "@/hooks/use-session";

/**
 * Renders nothing — just runs session validation on mount for every
 * authenticated route. Kept separate from TopNav so it can't accidentally
 * be skipped if the nav is ever restructured.
 */
export function SessionSync() {
  useSessionSync();
  return null;
}
