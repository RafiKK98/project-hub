/**
 * Standard API response envelope used across all endpoints.
 * Every response from the NestJS API is wrapped in this shape.
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  timestamp: string
}

/**
 * Standard API error response shape.
 */
export interface ApiError {
  success: false
  statusCode: number
  message: string
  errors?: Record<string, string[]>
  timestamp: string
  path: string
}

/**
 * Paginated list response.
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}
