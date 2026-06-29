// ─────────────────────────────────────────────────────────────────────────────
// Auth DTOs — mirrored from NestJS DTOs for frontend type safety.
// The source of truth for shape is always the backend DTO + Zod schema.
// ─────────────────────────────────────────────────────────────────────────────

export type AuthProvider = "local" | "google" | "github";

export type UserRole = "USER" | "ADMIN" | "SUPPORT";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
}

// ── Request payloads ─────────────────────────────────────────────────────────

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

// ── Response shapes ──────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}
