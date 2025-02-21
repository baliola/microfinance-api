import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, IsUrl } from 'class-validator';

export class AddDebtorToCreditorDTO {
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
  creditor_code: string;

  @ApiProperty({
    description: 'Creditor name.',
    example: 'creditor name...',
  })
  @IsString()
  creditor_name: string;

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
}
