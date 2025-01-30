import { ApiProperty } from '@nestjs/swagger';
import { WalletAddressType } from 'src/utils/type/type';

export class RegistrationCreditorResponseDTO {
  @ApiProperty({
    description: 'Unique wallet address.',
    example: '0x...',
  })
  wallet_address: WalletAddressType;

  message: string;
}
