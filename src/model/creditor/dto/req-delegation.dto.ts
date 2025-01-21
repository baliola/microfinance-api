import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ReqCreditorDelegationDTO {
  @ApiProperty({
    description: 'National Identification number.',
    example: '123...',
  })
  @IsString()
  nik: string;

  @ApiProperty({
    description: 'Unique wallet address from creditor.',
    example: '0x...',
  })
  @IsString()
  creditor_wallet_address: string;
}
