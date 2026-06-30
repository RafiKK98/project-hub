import { ApiProperty } from '@nestjs/swagger';
import { ProjectMemberRole } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateProjectMemberRoleDto {
  @ApiProperty({ enum: ProjectMemberRole })
  @IsEnum(ProjectMemberRole)
  role!: ProjectMemberRole;
}
