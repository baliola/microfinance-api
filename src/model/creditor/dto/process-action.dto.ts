import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUrl } from 'class-validator';

export class ProcessActionDTO {
  @ApiProperty({
    description: 'National Identification number from debtor.',
    example: '123...',
  })
  @IsString()
  debtor_nik: string;

  @ApiProperty({
    description: 'Debtor name.',
    example: 'Debtor name...',
  })
  @IsString()
  debtor_name: string;

  @ApiProperty({
    description: 'Unique code from creditor.',
    example: '...',
  })
  @IsString()
  creditor_consumer_code: string;

  @ApiProperty({
    description: 'Unique code from creditor.',
    example: '...',
  })
  @IsString()
  creditor_provider_code: string;

  @ApiProperty({
    description: 'Creditor Provider name.',
    example: 'creditor name...',
  })
  @IsString()
  creditor_provider_name: string;

  @ApiProperty({
    description: 'Date of application sent.',
    example: '...',
  })
  @IsDateString()
  application_date: string;

  @ApiProperty({
    description: 'Date of application approved or rejected.',
    example: '...',
  })
  @IsDateString()
  approval_date: string;

  @ApiProperty({
    description: 'Url of KTP.',
    example: 'https://...',
  })
  @IsUrl()
  url_KTP: string;

  @ApiProperty({
    description: 'Url of Approval.',
    example: 'https://...',
  })
  @IsUrl()
  url_approval: string;

  @ApiProperty({
    description: 'Unique Identifier of the request.',
    example: '...',
  })
  @IsString()
  @IsOptional()
  request_id: string;

  @ApiProperty({
    description: 'Unique Identifier of the transaction.',
    example: '...',
  })
  @IsString()
  @IsOptional()
  transaction_id: string;

  @ApiProperty({
    description: 'Unique Identifier of the reference.',
    example: '...',
  })
  @IsString()
  @IsOptional()
  reference_id: string;

  @ApiProperty({
    description: 'Date of the request.',
    example: '...',
  })
  @IsDateString()
  @IsOptional()
  request_date: string;
}
