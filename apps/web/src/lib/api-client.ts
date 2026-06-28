import type { ApiError, ApiResponse } from '@projecthub/types'

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000'

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiError,
  ) {
    super(body.message)
    this.name = 'ApiClientError'
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options

  const response = await fetch(`${API_BASE_URL}/api/v1${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  })

  if (!response.ok) {
    const error = (await response.json()) as ApiError
    throw new ApiClientError(response.status, error)
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}
