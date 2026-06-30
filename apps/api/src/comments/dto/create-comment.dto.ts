import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 'This looks good, but can we double check the mobile breakpoint?',
  })
  @IsString()
  @MinLength(1, { message: 'Comment cannot be empty' })
  @MaxLength(5000, { message: 'Comment must be at most 5000 characters' })
  body!: string;
}
