import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    // Suppress NestJS startup logs in production; use structured logger instead
    logger:
      process.env['NODE_ENV'] === 'production'
        ? ['error', 'warn']
        : ['log', 'error', 'warn', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // ── Global prefix & versioning ─────────────────────────────────────────────
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // ── CORS ───────────────────────────────────────────────────────────────────
  app.enableCors({
    origin:
      nodeEnv === 'production'
        ? [configService.get<string>('FRONTEND_URL', 'https://yourdomain.com')]
        : ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Global exception filter ────────────────────────────────────────────────
  // Catches all unhandled exceptions and returns a consistent ApiError shape.
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ── Global validation pipe ─────────────────────────────────────────────────
  // whitelist strips properties not in the DTO, forbidNonWhitelisted throws.
  // This is your first line of defense against malformed input.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── Swagger (development only) ─────────────────────────────────────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('ProjectHub API')
      .setDescription('Project Management Platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(port);
  console.warn(`🚀 API running on http://localhost:${port}/api/v1`);
  console.warn(`📖 Swagger available at http://localhost:${port}/api/docs`);
}

void bootstrap();
