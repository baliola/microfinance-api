import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ReqCreditorDelegationDTO {
  @ApiProperty({
    description: 'National Identification number from customer.',
    example: '123...',
  })
  @IsString()
  customer_nik: string;

  @ApiProperty({
    description: 'Creditor Consumer Code.',
    example: '...',
  })
  @IsString()
  consumer_code: string;

  @ApiProperty({
    description: 'Creditor Provider Code.',
    example: '...',
  })
  @IsString()
  provider_code: string;
}
