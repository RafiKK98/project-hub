import type { CommentDto } from '@projecthub/types';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateCommentDto, UpdateCommentDto } from './dto';
export declare class CommentsService {
    private readonly prisma;
    private readonly notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    create(orgId: string, projectId: string, issueNumber: number, userId: string, dto: CreateCommentDto): Promise<CommentDto>;
    findAllForIssue(orgId: string, projectId: string, issueNumber: number, userId: string): Promise<CommentDto[]>;
    update(orgId: string, projectId: string, issueNumber: number, commentId: string, userId: string, dto: UpdateCommentDto): Promise<CommentDto>;
    delete(orgId: string, projectId: string, issueNumber: number, commentId: string, userId: string): Promise<void>;
    private assertIssueAccess;
    private canDeleteAnyComment;
    private toCommentDto;
}
//# sourceMappingURL=comments.service.d.ts.map