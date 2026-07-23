import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateLabelDto {
  @ApiPropertyOptional({ example: 'Enhancement' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  name?: string;

  @ApiPropertyOptional({ example: '#22c55e' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, {
    message: 'Color must be a valid hex color e.g. #22c55e',
  })
  color?: string;
}
