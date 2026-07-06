import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import 'reflect-metadata';
import serverlessHttp from 'serverless-http';

// Lazy-import AppModule to avoid issues with module resolution in serverless
let cachedApp: ReturnType<typeof serverlessHttp> | null = null;

async function bootstrap(): Promise<ReturnType<typeof serverlessHttp>> {
  if (cachedApp) return cachedApp;

  // Dynamic import so Vercel bundles correctly
  const { AppModule } = await import('../src/app.module.js');
  const { GlobalExceptionFilter } =
    await import('../src/common/filters/http-exception.filter.js');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.enableCors({
    origin: process.env['FRONTEND_URL'] ?? '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.init();

  // serverless-http wraps the Express instance for serverless execution
  const expressApp = app.getHttpAdapter().getInstance();
  cachedApp = serverlessHttp(expressApp);
  return cachedApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const handler = await bootstrap();
  return handler(req as never, res as never);
}
