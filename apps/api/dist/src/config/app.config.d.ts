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
declare const _default: (() => AppConfig) & import("@nestjs/config").ConfigFactoryKeyHost<AppConfig>;
export default _default;
//# sourceMappingURL=app.config.d.ts.map