import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global makes PrismaService available in every module without re-importing.
// This is the standard NestJS pattern for singleton infrastructure services.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
