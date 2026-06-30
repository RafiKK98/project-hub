import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { CommentDto } from '@projecthub/types';
import type { JwtPayload } from '../auth/token.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto';

@ApiTags('Comments')
@ApiBearerAuth()
@Controller('organizations/:orgId/projects/:projectId/issues/:number/comments')
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a comment to an issue' })
  create(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('number', ParseIntPipe) number: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentDto> {
    return this.comments.create(orgId, projectId, number, user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List comments on an issue' })
  findAll(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('number', ParseIntPipe) number: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<CommentDto[]> {
    return this.comments.findAllForIssue(orgId, projectId, number, user.sub);
  }

  @Patch(':commentId')
  @ApiOperation({ summary: 'Edit your own comment' })
  update(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('number', ParseIntPipe) number: number,
    @Param('commentId') commentId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCommentDto,
  ): Promise<CommentDto> {
    return this.comments.update(
      orgId,
      projectId,
      number,
      commentId,
      user.sub,
      dto,
    );
  }

  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a comment (author or project manager)' })
  delete(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('number', ParseIntPipe) number: number,
    @Param('commentId') commentId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.comments.delete(orgId, projectId, number, commentId, user.sub);
  }
}
