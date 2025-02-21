import { ApiProperty } from '@nestjs/swagger';
import { WalletAddressType } from 'src/utils/type/type';

export class GetDebtorResponseDTO {
  @ApiProperty({
    description: 'Unique address from Debtor',
    example: '0x...',
  })
  wallet_address: WalletAddressType;
}
