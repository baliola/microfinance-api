import { ApiProperty } from '@nestjs/swagger';
import { WalletAddressType } from 'src/utils/type/type';

export class RegistrationCreditorResponseDTO {
  @ApiProperty({
    description: 'Unique wallet address.',
    example: '0x...',
  })
  wallet_address: WalletAddressType;

  @ApiProperty({
    description: 'Transaction hash.',
    example: '...',
  })
  tx_hash: `0x${string}`;

  @ApiProperty({
    description: 'Base URL for the Onchain Registry API.',
    example: '...',
  })
  onchain_url: string;
}
