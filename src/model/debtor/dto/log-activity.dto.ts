import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LogActivityDTO {
  @ApiProperty({
    description: 'National Identification number.',
    example: '123...',
  })
  @IsString()
  nik: string;
}
