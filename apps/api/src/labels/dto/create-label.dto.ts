import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateLabelDto {
  @ApiProperty({ example: 'Bug' })
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  name!: string;

  @ApiProperty({ example: '#ef4444' })
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, {
    message: 'Color must be a valid hex color e.g. #ef4444',
  })
  color!: string;
}
