import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetActiveCreditorsDTO {
  @ApiProperty({
    description: 'National Identification number from Customer.',
    required: true,
    example: '123...',
  })
  @IsString()
  debtor_nik: string;
}
