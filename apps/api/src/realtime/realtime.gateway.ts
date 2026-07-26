import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MemberRole } from '@prisma/client';
import type { Server, Socket } from 'socket.io';
import { TokenService } from '../auth/token.service';
import { PrismaService } from '../database/prisma.service';

interface AuthenticatedSocket extends Socket {
  data: { userId?: string };
}

const ORG_ADMIN_ROLES: MemberRole[] = [MemberRole.OWNER, MemberRole.ADMIN];

@WebSocketGateway({
  namespace: '/realtime',
  cors: {
    origin: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  // private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly tokens: TokenService,
    private readonly prisma: PrismaService,
  ) {}

  // ── Connection auth ──────────────────────────────────────────────────────
  // The client passes its access token in the socket.io handshake auth
  // payload — same JWT used for REST, verified the same way.

  handleConnection(client: AuthenticatedSocket): void {
    const token = client.handshake.auth?.['token'] as string | undefined;
    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = this.tokens.verifyAccessToken(token);
      client.data.userId = payload.sub;
    } catch {
      client.disconnect();
    }
  }

  // ── Room management ──────────────────────────────────────────────────────
  // Joining a project room re-checks membership server-side — a stale or
  // forged client-side project id can't leak events for a project the user
  // doesn't actually have access to.

  @SubscribeMessage('join_project')
  async joinProject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { orgId: string; projectId: string },
  ): Promise<void> {
    const userId = client.data.userId;
    if (!userId) return;

    const hasAccess = await this.checkProjectAccess(
      data.orgId,
      data.projectId,
      userId,
    );
    if (!hasAccess) return;

    await client.join(`project:${data.projectId}`);
  }

  @SubscribeMessage('leave_project')
  async leaveProject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { projectId: string },
  ): Promise<void> {
    await client.leave(`project:${data.projectId}`);
  }

  private async checkProjectAccess(
    orgId: string,
    projectId: string,
    userId: string,
  ): Promise<boolean> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: orgId },
    });
    if (!project) return false;

    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
    });
    if (!membership) return false;
    if (ORG_ADMIN_ROLES.includes(membership.role)) return true;

    const projectMember = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    return Boolean(projectMember);
  }

  // ── Emit helper — called by IssuesService / CommentsService ─────────────

  emitToProject<T>(
    projectId: string,
    event: string,
    payload: T,
    actorUserId?: string,
  ): void {
    this.server
      .to(`project:${projectId}`)
      .emit(event, { payload, actorUserId });
  }
}
