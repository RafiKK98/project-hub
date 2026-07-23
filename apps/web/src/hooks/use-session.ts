"use client";

import { authApi } from "@/lib/auth-api";
import { useAuthStore } from "@/store/auth.store";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Validates the current session against the server on mount, and keeps the
 * cached user profile in the auth store fresh (name/avatar/role changes
 * elsewhere show up without a manual refresh).
 *
 * If the request fails even after the api-client's silent refresh attempt,
 * the session is genuinely dead — clear it client-side so the UI reflects
 * reality instead of showing a stale "logged in" state with a broken token.
 */
export function useSessionSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const clearSession = useAuthStore((s) => s.clearSession);

  const { data, isError } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    enabled: isAuthenticated,
    retry: false,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (data) setUser(data);
  }, [data, setUser]);

  useEffect(() => {
    if (isError) clearSession();
  }, [isError, clearSession]);
}
