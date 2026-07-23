import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class SetIssueLabelsDto {
  @ApiProperty({ example: ['label-id-1', 'label-id-2'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  labelIds!: string[];
}
