import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

export class DelegationApprovalDTO {
  @ApiProperty({
    description: 'National Identification number from Customer.',
    example: '123',
  })
  @IsString()
  debtor_nik: string;

  @ApiProperty({
    description: 'Unique code from creditor (consumer).',
    example: '123',
  })
  @IsString()
  creditor_consumer_code: string;

  @ApiProperty({
    description: 'Unique code from creditor (provider).',
    example: '123',
  })
  @IsString()
  creditor_provider_code: string;

  @ApiProperty({
    description: 'Unique Identifier of the request.',
    example: '123',
  })
  @IsString()
  request_id: string;

  @ApiProperty({
    description: 'Unique Identifier of the transaction.',
    example: '123',
  })
  @IsString()
  transaction_id: string;

  @ApiProperty({
    description: 'Unique Identifier of the reference.',
    example: '123',
  })
  @IsString()
  reference_id: string;

  @ApiProperty({
    description: 'Date of the request.',
    example: 'YYYY-MM-DD',
  })
  @IsDateString()
  request_date: string;
}
