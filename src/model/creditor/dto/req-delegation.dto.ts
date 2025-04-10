import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ReqCreditorDelegationDTO {
  @ApiProperty({
    description: 'National Identification number from customer.',
    example: '123',
  })
  @IsString()
  debtor_nik: string;

  @ApiProperty({
    description: 'Creditor Consumer Code.',
    example: '12345',
  })
  @IsString()
  creditor_consumer_code: string;

  @ApiProperty({
    description: 'Creditor Provider Code.',
    example: '12345',
  })
  @IsString()
  creditor_provider_code: string;

  @ApiProperty({
    description: 'Unique Identifier of the request.',
    example: '123',
  })
  @IsString()
  @IsOptional()
  request_id: string;

  @ApiProperty({
    description: 'Unique Identifier of the transaction.',
    example: '123',
  })
  @IsString()
  @IsOptional()
  transaction_id: string;

  @ApiProperty({
    description: 'Unique Identifier of the reference.',
    example: '123',
  })
  @IsString()
  @IsOptional()
  reference_id: string;

  @ApiProperty({
    description: 'Date of the request.',
    example: 'YYYY-MM-DD',
  })
  @IsDateString()
  @IsOptional()
  request_date: string;
}
