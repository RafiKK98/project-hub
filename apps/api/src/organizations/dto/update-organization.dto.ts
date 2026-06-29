import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'Acme Corp' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  name?: string;

  @ApiPropertyOptional({ example: 'We build great things' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  description?: string;
}
