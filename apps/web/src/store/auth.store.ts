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
    },
  ),
);
