import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ReqCreditorDelegationDTO {
  @ApiProperty({
    description: 'National Identification number from customer.',
    example: '123...',
  })
  @IsString()
  debtor_nik: string;

  @ApiProperty({
    description: 'Creditor Consumer Code.',
    example: '...',
  })
  @IsString()
  creditor_consumer_code: string;

  @ApiProperty({
    description: 'Creditor Provider Code.',
    example: '...',
  })
  @IsString()
  creditor_provider_code: string;
}
