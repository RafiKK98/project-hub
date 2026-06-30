import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Website Redesign' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(64, { message: 'Name must be at most 64 characters long' })
  name!: string;

  @ApiProperty({
    example: 'WEB',
    description: 'Short uppercase identifier, 2–6 characters',
  })
  @IsString()
  @MinLength(2, { message: 'Identifier must be at least 2 characters' })
  @MaxLength(6, { message: 'Identifier must be at most 6 characters' })
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Identifier must be uppercase letters and numbers only',
  })
  identifier!: string;

  @ApiPropertyOptional({ example: 'Redesigning the public marketing site' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  description?: string;
}
