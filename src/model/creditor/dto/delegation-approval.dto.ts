import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

export class DelegationApprovalDTO {
  @ApiProperty({
    description: 'National Identification number from Customer.',
    example: '123...',
  })
  @IsString()
  debtor_nik: string;

  @ApiProperty({
    description: 'Unique code from creditor (consumer).',
    example: '...',
  })
  @IsString()
  creditor_consumer_code: string;

  @ApiProperty({
    description: 'Unique code from creditor (provider).',
    example: '...',
  })
  @IsString()
  creditor_provider_code: string;

  @ApiProperty({
    description: 'Unique Identifier of the request.',
    example: '...',
  })
  @IsString()
  request_id: string;

  @ApiProperty({
    description: 'Unique Identifier of the transaction.',
    example: '...',
  })
  @IsString()
  transaction_id: string;

  @ApiProperty({
    description: 'Unique Identifier of the reference.',
    example: '...',
  })
  @IsString()
  reference_id: string;

  @ApiProperty({
    description: 'Date of the request.',
    example: '...',
  })
  @IsDateString()
  request_date: string;
}
