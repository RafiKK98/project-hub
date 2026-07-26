import { AuthModule } from '@/auth/auth.module';
import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

@Module({
  // AuthModule exports TokenService, which the gateway uses to verify the
  // JWT sent in the socket.io handshake — same verification path as REST.
  imports: [AuthModule],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
