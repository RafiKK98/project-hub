import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IssueStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class ReorderIssueDto {
  /**
   * The boardOrder value to place this issue at.
   * Computed by the frontend as the midpoint between its new neighbors.
   */
  @ApiProperty({ example: 1.5 })
  @IsNumber()
  boardOrder!: number;

  /**
   * Optionally change the status column at the same time as reordering.
   * Used when dragging across columns.
   */
  @ApiPropertyOptional({ enum: IssueStatus })
  @IsOptional()
  @IsEnum(IssueStatus)
  status?: IssueStatus;
}
