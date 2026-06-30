import { ApiProperty } from '@nestjs/swagger';
import { ProjectMemberRole } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class AddProjectMemberDto {
  @ApiProperty({ example: 'cuid_of_user' })
  @IsString()
  userId!: string;

  @ApiProperty({
    enum: ProjectMemberRole,
    example: ProjectMemberRole.DEVELOPER,
  })
  @IsEnum(ProjectMemberRole)
  role!: ProjectMemberRole;
}
