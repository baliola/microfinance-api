import { ApiProperty } from '@nestjs/swagger';
import { WalletAddressType } from 'src/utils/type/type';

export class GetCreditorResponseDTO {
  @ApiProperty({
    description: 'Unique address from Creditor',
    example: '0x...',
  })
  wallet_address: WalletAddressType;
}
