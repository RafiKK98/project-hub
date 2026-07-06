"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: process.env['NODE_ENV'] === 'production'
            ? ['error', 'warn']
            : ['log', 'error', 'warn', 'debug'],
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('app.port', 4000);
    const nodeEnv = configService.get('app.nodeEnv', 'development');
    const frontendUrl = configService.get('app.frontendUrl', 'http://localhost:3000');
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: common_1.VersioningType.URI, defaultVersion: '1' });
    const allowedOrigins = nodeEnv === 'production'
        ? [frontendUrl]
        : ['http://localhost:3000', 'http://127.0.0.1:3000'];
    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        maxAge: 86400,
    });
    app.useGlobalFilters(new http_exception_filter_1.GlobalExceptionFilter());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    if (nodeEnv !== 'production') {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle('ProjectHub API')
            .setDescription('Project Management Platform API')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
    }
    await app.listen(port);
    if (nodeEnv !== 'production') {
        console.warn(`🚀 API running on http://localhost:${port}/api/v1`);
        console.warn(`📖 Swagger available at http://localhost:${port}/api/docs`);
    }
}
void bootstrap();
//# sourceMappingURL=main.js.map