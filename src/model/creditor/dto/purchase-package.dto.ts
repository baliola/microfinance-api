import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString } from 'class-validator';
import { WalletAddressType } from 'src/utils/type/type';

export class PurchasePackageDTO {
  @ApiProperty({
    description: 'Creditor Unique Address.',
    example: '123',
  })
  @IsString()
  creditor_address: WalletAddressType;

  @ApiProperty({
    description: 'Institution Unique Code.',
    example: '123',
  })
  @IsString()
  institution_code: string;

  @ApiProperty({
    description: 'Date of the Package Purchase.',
    example: 'YYYY-MM-DD',
  })
  @IsString()
  purchase_date: string;

  @ApiProperty({
    description: 'Unique Number as Identity of the Invoice.',
    example: '12345',
  })
  @IsString()
  invoice_number: string;

  @ApiProperty({
    description: 'Unique Number as Identity of the Package.',
    example: 0,
  })
  @IsNumber()
  package_id: number;

  @ApiProperty({
    description: 'Number of Package Quantity.',
    example: 0,
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Date of Package Start.',
    example: 'YYYY-MM-DD',
  })
  @IsDateString()
  start_date: string;

  @ApiProperty({
    description: 'Date of Package End.',
    example: 'YYYY-MM-DD',
  })
  @IsDateString()
  end_date: string;

  @ApiProperty({
    description: 'Number of Quota',
    example: 0,
  })
  @IsNumber()
  quota: number;
}
