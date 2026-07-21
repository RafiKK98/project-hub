"use client";

import { AuthTokens, AuthUser } from "@projecthub/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;

  //   Actions
  setSession: (user: AuthUser, tokens: AuthTokens) => void;
  clearSession: () => void;
  setUser: (user: AuthUser) => void;
}

function isTokenExpired(token?: string) {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]!));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      setSession: (user, tokens) =>
        set({ user, tokens, isAuthenticated: true }),
      clearSession: () =>
        set({ user: null, tokens: null, isAuthenticated: false }),
      setUser: (user) => set((state) => ({ ...state, user })),
    }),
    {
      name: "projecthub-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state?.tokens?.accessToken) return;
        if (isTokenExpired(state.tokens.accessToken)) state.clearSession();
      },
    },
  ),
);
