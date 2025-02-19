import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RemoveDebtorDTO {
  @ApiProperty({
    description: 'National Identification number.',
    example: '123...',
  })
  @IsString()
  debtor_nik: string;
}
