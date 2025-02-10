import { ApiProperty } from '@nestjs/swagger';
import { WalletAddressType } from 'src/utils/type/type';

export class RegistrationDebtorResponseDTO {
  @ApiProperty({
    description: 'Unique wallet address.',
    example: '0x...',
  })
  wallet_address: WalletAddressType;

  @ApiProperty({
    description: 'Transaction Hash.',
    example: '0x...',
  })
  tx_hash: WalletAddressType;

  @ApiProperty({
    description: 'Base URL for the Onchain Registry API.',
    example: '...',
  })
  onchain_url: string;
}
