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

export default registerAs('app', (): AppConfig => {
  const required = (key: string): string => {
    const value = process.env[key];
    if (!value)
      throw new Error(`Missing required environment variable: ${key}`);
    return value;
  };

  return {
    nodeEnv: process.env['NODE_ENV'] ?? 'development',
    port: parseInt(process.env['PORT'] ?? '4000', 10),
    frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
    database: {
      url: required('DATABASE_URL'),
      directUrl: process.env['DIRECT_URL'] ?? required('DATABASE_URL'),
    },
    jwt: {
      secret:
        process.env['JWT_SECRET'] ?? 'dev-jwt-secret-change-in-production',
      expiresIn: process.env['JWT_EXPIRES_IN'] ?? '15m',
      refreshSecret:
        process.env['JWT_REFRESH_SECRET'] ??
        'dev-refresh-secret-change-in-production',
      refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
    },
  };
});
