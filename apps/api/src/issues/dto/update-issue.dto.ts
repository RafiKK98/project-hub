import { ApiPropertyOptional } from '@nestjs/swagger';
import { IssuePriority, IssueStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateIssueDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(256)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;

  @ApiPropertyOptional({ enum: IssueStatus })
  @IsOptional()
  @IsEnum(IssueStatus)
  status?: IssueStatus;

  @ApiPropertyOptional({ enum: IssuePriority })
  @IsOptional()
  @IsEnum(IssuePriority)
  priority?: IssuePriority;

  @ApiPropertyOptional({ description: 'Pass null to unassign' })
  @IsOptional()
  @IsString()
  assigneeId?: string | null;

  @ApiPropertyOptional({ description: 'Pass null to clear the due date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string | null;
}
