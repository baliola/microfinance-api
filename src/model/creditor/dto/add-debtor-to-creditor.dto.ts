import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, IsUrl } from 'class-validator';

export class AddDebtorToCreditorDTO {
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
  creditor_code: string;

  @ApiProperty({
    description: 'Creditor name.',
    example: 'Example Name',
  })
  @IsString()
  creditor_name: string;

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
}
