import { ApiProperty } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';
import { IsEmail, IsEnum } from 'class-validator';

export class InviteMemberDto {
  @ApiProperty({ example: 'colleague@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @ApiProperty({ enum: MemberRole, example: MemberRole.DEVELOPER })
  @IsEnum(MemberRole, { message: 'Invalid member role' })
  role!: MemberRole;
}
