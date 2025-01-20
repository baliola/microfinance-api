import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ReqProviderDelegationDTO {
  @ApiProperty({
    description: 'National Identification number.',
    example: '123...',
  })
  @IsString()
  nik: string;

  @ApiProperty({
    description: 'Unique wallet address from provider.',
    example: '0x...',
  })
  @IsString()
  provider_wallet_address: string;
}
