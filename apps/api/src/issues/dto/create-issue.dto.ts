import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IssuePriority } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateIssueDto {
  @ApiProperty({ example: 'Fix login button alignment on mobile' })
  @IsString()
  @MinLength(2, { message: 'Title must be at least 2 characters' })
  @MaxLength(256, { message: 'Title must be at most 256 characters' })
  title!: string;

  @ApiPropertyOptional({
    example: 'The button overlaps the footer on screens narrower than 375px',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;

  @ApiPropertyOptional({
    enum: IssuePriority,
    default: IssuePriority.NO_PRIORITY,
  })
  @IsOptional()
  @IsEnum(IssuePriority)
  priority?: IssuePriority;

  @ApiPropertyOptional({ example: 'cuid_of_assignee' })
  @IsOptional()
  @IsString()
  assigneeId?: string;

  @ApiPropertyOptional({ example: '2026-07-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({
    description:
      'Creates this issue directly as a subtask of the given parent issue ID',
    example: 'cuid_of_parent_issue',
  })
  @IsOptional()
  @IsString()
  parentId?: string;
}
