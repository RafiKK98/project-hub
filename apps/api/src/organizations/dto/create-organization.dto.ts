import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(64, { message: 'Name must be at most 64 characters' })
  name!: string;

  @ApiPropertyOptional({ example: 'We build great things' })
  @IsOptional()
  @IsString()
  @MaxLength(512, { message: 'Description must be at most 512 characters' })
  description?: string;
}
