export type HealthStatus = 'ok' | 'degraded' | 'down'

export interface HealthCheckResult {
  status: HealthStatus
  version: string
  uptime: number
  timestamp: string
  services: {
    database: HealthStatus
  }
}
