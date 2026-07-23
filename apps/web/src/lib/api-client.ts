import type { ApiError } from "@projecthub/types";
import { authApi } from "./auth-api";

const API_BASE_URL =
  process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";
const AUTH_STORAGE_KEY = "projecthub-auth";

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiError,
  ) {
    super(body.message);
    this.name = "ApiClientError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Skip auth token injection and refresh retry (used for login/register) */
  skipAuth?: boolean;
}

interface PersistedAuthState {
  state?: {
    user?: unknown;
    tokens?: { accessToken?: string; refreshToken?: string };
    isAuthenticated?: boolean;
  };
  version?: number;
}

// ── Storage helpers ─────────────────────────────────────────────────────────
// Reads/writes the same localStorage key the Zustand auth store persists to,
// so a token refresh here stays in sync with the store without a circular
// import back into auth.store.ts / auth-api.ts.

function readAuthStorage(): PersistedAuthState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedAuthState) : null;
  } catch {
    return null;
  }
}

function getAccessToken(): string | null {
  return readAuthStorage()?.state?.tokens?.accessToken ?? null;
}

function getRefreshToken(): string | null {
  return readAuthStorage()?.state?.tokens?.refreshToken ?? null;
}

function writeTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}): void {
  if (typeof window === "undefined") return;
  const parsed = readAuthStorage();
  if (!parsed?.state) return;

  parsed.state.tokens = tokens;
  parsed.state.isAuthenticated = true;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));

  // Keep the middleware-readable cookie in sync too
  document.cookie = `ph-access-token=${tokens.accessToken}; path=/; max-age=${15 * 60}; SameSite=Strict`;
}

function clearAuthStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  document.cookie = "ph-access-token=; path=/; max-age=0";
}

// ── Refresh — deduped so concurrent 401s only trigger one refresh call ──────

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise)
    refreshPromise = authApi
      .refresh(refreshToken)
      .then(async (tokens) => {
        writeTokens(tokens);
        return tokens.accessToken;
      })
      .catch(() => null)
      .finally(() => (refreshPromise = null));

  return refreshPromise;
}

// ── Request ───────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers, skipAuth, ...rest } = options;

  async function doFetch(token: string | null): Promise<Response> {
    const authHeaders: Record<string, string> = {};
    if (!skipAuth && token) authHeaders["Authorization"] = `Bearer ${token}`;

    return fetch(`${API_BASE_URL}/api/v1${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...headers,
      },
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });
  }

  let response = await doFetch(skipAuth ? null : getAccessToken());

  // Silent refresh-and-retry, once, on an expired access token.
  // Never triggered for the refresh call itself or explicitly public requests.
  if (response.status === 401 && !skipAuth && path !== "/auth/refresh") {
    const newToken = await refreshAccessToken();

    if (newToken) response = await doFetch(newToken);
    else {
      // Refresh token is also invalid/expired — the session is truly over.
      clearAuthStorage();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
  }

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new ApiClientError(response.status, error);
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "body">) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
