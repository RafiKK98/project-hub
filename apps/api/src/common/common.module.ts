import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guard';
/**
 * CommonModule provides shared guards, decorators, and utilities
 * that are available across all feature modules.
 *
 * @Global() ensures it is only imported once (in AppModule).
 */
@Global()
@Module({
  providers: [
    // RolesGuard runs after JwtAuthGuard (which is registered in AuthModule).
    // Guard execution order follows registration order in AppModule.
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [],
})
export class CommonModule {}
