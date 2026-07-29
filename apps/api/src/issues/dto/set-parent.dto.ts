import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, ValidateIf } from 'class-validator';

export class SetParentDto {
  @ApiPropertyOptional({
    description:
      'Parent issue ID to link as a subtask, or null to remove the relationship',
    nullable: true,
    example: 'cuid_of_parent_issue',
  })
  @ValidateIf((_, value) => value !== null)
  @IsString()
  parentId!: string | null;
}
