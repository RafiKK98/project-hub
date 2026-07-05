import { registerAs } from '@nestjs/config';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  frontendUrl: string;
  database: {
    url: string;
    directUrl: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
}

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function requireInProduction(key: string, devFallback: string): string {
  const value = process.env[key];
  if (!value) {
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error(
        `Missing required environment variable in production: ${key}`,
      );
    }
    return devFallback;
  }
  return value;
}

export default registerAs('app', (): AppConfig => {
  return {
    nodeEnv: process.env['NODE_ENV'] ?? 'development',
    port: parseInt(process.env['PORT'] ?? '4000', 10),
    frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
    database: {
      url: required('DATABASE_URL'),
      directUrl: process.env['DIRECT_URL'] ?? required('DATABASE_URL'),
    },
    jwt: {
      secret: requireInProduction(
        'JWT_SECRET',
        'dev-jwt-secret-do-not-use-in-production-32-chars',
      ),
      expiresIn: process.env['JWT_EXPIRES_IN'] ?? '15m',
      refreshSecret: requireInProduction(
        'JWT_REFRESH_SECRET',
        'dev-refresh-secret-do-not-use-in-production-32',
      ),
      refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
    },
  };
});
