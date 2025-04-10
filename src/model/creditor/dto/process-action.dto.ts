import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUrl } from 'class-validator';

export class ProcessActionDTO {
  @ApiProperty({
    description: 'National Identification number from debtor.',
    example: '123',
  })
  @IsString()
  debtor_nik: string;

  @ApiProperty({
    description: 'Debtor name.',
    example: 'Example Name',
  })
  @IsString()
  debtor_name: string;

  @ApiProperty({
    description: 'Unique code from creditor.',
    example: '123',
  })
  @IsString()
  creditor_consumer_code: string;

  @ApiProperty({
    description: 'Unique code from creditor.',
    example: '123',
  })
  @IsString()
  creditor_provider_code: string;

  @ApiProperty({
    description: 'Creditor Provider name.',
    example: 'Example Name',
  })
  @IsString()
  creditor_provider_name: string;

  @ApiProperty({
    description: 'Date of application sent.',
    example: 'YYYY-MM-DD',
  })
  @IsDateString()
  application_date: string;

  @ApiProperty({
    description: 'Date of application approved or rejected.',
    example: 'YYYY-MM-DD',
  })
  @IsDateString()
  approval_date: string;

  @ApiProperty({
    description: 'Url of KTP.',
    example: 'https://example.com',
  })
  @IsUrl()
  url_KTP: string;

  @ApiProperty({
    description: 'Url of Approval.',
    example: 'https://example.com',
  })
  @IsUrl()
  url_approval: string;

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
