import type {
  AuthResponse,
  AuthTokens,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@projecthub/types";
import { apiClient } from "./api-client";

export const authApi = {
  register: (payload: RegisterPayload): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>("/auth/register", payload, { skipAuth: true }),

  login: (payload: LoginPayload): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>("/auth/login", payload, { skipAuth: true }),

  refresh: (refreshToken: string): Promise<AuthTokens> =>
    apiClient.post<AuthTokens>(
      "/auth/refresh",
      { refreshToken },
      { skipAuth: true },
    ),

  logout: (): Promise<void> => apiClient.post<void>("/auth/logout"),

  me: (): Promise<AuthUser> => apiClient.get<AuthUser>("/auth/me"),
};
