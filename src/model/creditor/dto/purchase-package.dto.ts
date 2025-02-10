import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { WalletAddressType } from 'src/utils/type/type';

export class PurchasePackageDTO {
  @ApiProperty({
    description: 'Creditor Unique Address.',
    example: '0x...',
  })
  @IsString()
  creditor_address: WalletAddressType;

  @ApiProperty({
    description: 'Institution Unique Code.',
    example: '...',
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
    example: '...',
  })
  @IsNumber()
  invoice_number: string;

  @ApiProperty({
    description: 'Unique Number as Identity of the Package.',
    example: '...',
  })
  @IsNumber()
  package_id: number;

  @ApiProperty({
    description: 'Number of Package Quantity.',
    example: '...',
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Date of Package Start.',
    example: 'YYYY-MM-DD',
  })
  @IsString()
  start_date: string;

  @ApiProperty({
    description: 'Date of Package End.',
    example: 'YYYY-MM-DD',
  })
  @IsString()
  end_date: string;

  @ApiProperty({
    description: 'Number of Quota',
    example: 'YYYY-MM-DD',
  })
  @IsNumber()
  quota: number;
}
