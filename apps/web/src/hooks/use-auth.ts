"use client";

import { ApiClientError } from "@/lib/api-client";
import { authApi } from "@/lib/auth-api";
import { disconnectSocket } from "@/lib/socket";
import type {
  LoginFormValues,
  RegisterFormValues,
} from "@/lib/validations/auth.schema";
import { useAuthStore } from "@/store/auth.store";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, tokens, isAuthenticated, setSession, clearSession } =
    useAuthStore();

  async function login(values: LoginFormValues): Promise<boolean> {
    try {
      const { user, tokens } = await authApi.login(values);
      // Clear any previous user's cached data before setting the new session
      queryClient.clear();
      setSession(user, tokens);
      document.cookie = `ph-access-token=${tokens.accessToken}; path=/; max-age=${15 * 60}; SameSite=Strict`;
      router.push("/dashboard");
      toast.success(`Welcome back, ${user.name ?? user.email}`);
      return true;
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.body.message
          : "Something went wrong. Please try again.";
      toast.error(message);
      return false;
    }
  }

  async function register(values: RegisterFormValues): Promise<boolean> {
    try {
      const { user, tokens } = await authApi.register(values);
      queryClient.clear();
      setSession(user, tokens);
      document.cookie = `ph-access-token=${tokens.accessToken}; path=/; max-age=${15 * 60}; SameSite=Strict`;
      router.push("/dashboard");
      toast.success(`Welcome to ProjectHub, ${user.name}!`);
      return true;
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.body.message
          : "Something went wrong. Please try again.";
      toast.error(message);
      return false;
    }
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch {
      // Always clear local session even if the API call fails
    } finally {
      // Close the realtime connection so it doesn't keep retrying with a
      // dead token, and so the next user who logs in on this device gets a
      // fresh connection instead of inheriting this one's room memberships.
      disconnectSocket();
      queryClient.clear();
      clearSession();
      document.cookie = "ph-access-token=; path=/; max-age=0";
      router.push("/login");
      toast.success("You have been logged out");
    }
  }

  return { user, tokens, isAuthenticated, login, register, logout };
}
