"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
require("reflect-metadata");
const serverless_http_1 = __importDefault(require("serverless-http"));
let cachedApp = null;
async function bootstrap() {
    if (cachedApp)
        return cachedApp;
    const { AppModule } = await import('../src/app.module.js');
    const { GlobalExceptionFilter } = await import('../src/common/filters/http-exception.filter.js');
    const app = await core_1.NestFactory.create(AppModule, {
        logger: ['error', 'warn'],
    });
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: common_1.VersioningType.URI, defaultVersion: '1' });
    app.enableCors({
        origin: process.env['FRONTEND_URL'] ?? '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    cachedApp = (0, serverless_http_1.default)(expressApp);
    return cachedApp;
}
async function handler(req, res) {
    const handler = await bootstrap();
    return handler(req, res);
}
//# sourceMappingURL=index.js.map