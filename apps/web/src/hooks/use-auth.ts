"use client";

import { ApiClientError } from "@/lib/api-client";
import { authApi } from "@/lib/auth-api";
import {
  LoginFormValues,
  RegisterFormValues,
} from "@/lib/validations/auth.schema";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useAuth() {
  const router = useRouter();
  const { user, tokens, isAuthenticated, setSession, clearSession } =
    useAuthStore();

  async function login(values: LoginFormValues): Promise<boolean> {
    try {
      const { user, tokens } = await authApi.login(values);
      setSession(user, tokens);
      // Set cookie for middleware to read
      document.cookie = `ph-access-token=${tokens.accessToken}; path=/; max-age=${15 * 60}; SameSite=Strict`;
      router.push("/orgs");
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
      setSession(user, tokens);
      document.cookie = `ph-access-token=${tokens.accessToken}; path=/; max-age=${15 * 60}; SameSite=Strict`;
      router.push("/orgs");
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
      clearSession();
      document.cookie = "ph-access-token=; path=/; max-age=0";
      router.push("/login");
      toast.success("You have been logged out");
    }
  }

  return { user, tokens, isAuthenticated, login, register, logout };
}
