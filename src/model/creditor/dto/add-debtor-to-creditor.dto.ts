import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddDebtorToCreditorDTO {
  @ApiProperty({
    description: 'National Identification number from debtor.',
    example: '123...',
  })
  @IsString()
  debtor_nik: string;

  @ApiProperty({
    description: 'Unique code from creditor.',
    example: '...',
  })
  @IsString()
  creditor_code: string;

  @ApiProperty({
    description: 'Debtor name.',
    example: 'Debtor name...',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Creditor name.',
    example: 'Creditor name...',
  })
  @IsString()
  creditor_name: string;

  @ApiProperty({
    description: 'Date of application sent.',
    example: '...',
  })
  @IsString()
  application_date: string;

  @ApiProperty({
    description: 'Date of application approved or rejected.',
    example: '...',
  })
  @IsString()
  approval_date: string;

  @ApiProperty({
    description: 'Url of KTP.',
    example: 'https://...',
  })
  @IsString()
  url_KTP: string;

  @ApiProperty({
    description: 'Url of Approval.',
    example: 'https://...',
  })
  @IsString()
  url_approval: string;
}
