import type { CommentDto } from '@projecthub/types';
import type { JwtPayload } from '../auth/token.service';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto';
export declare class CommentsController {
    private readonly comments;
    constructor(comments: CommentsService);
    create(orgId: string, projectId: string, number: number, user: JwtPayload, dto: CreateCommentDto): Promise<CommentDto>;
    findAll(orgId: string, projectId: string, number: number, user: JwtPayload): Promise<CommentDto[]>;
    update(orgId: string, projectId: string, number: number, commentId: string, user: JwtPayload, dto: UpdateCommentDto): Promise<CommentDto>;
    delete(orgId: string, projectId: string, number: number, commentId: string, user: JwtPayload): Promise<void>;
}
//# sourceMappingURL=comments.controller.d.ts.map