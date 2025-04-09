import { ApiProperty } from '@nestjs/swagger';
import { WalletAddressType } from 'src/utils/type/type';

export class GetActiveCreditorsResponseDTO {
  @ApiProperty({
    description: 'List of creditors.',
    example: '[0x..., 0x...]',
  })
  creditors: WalletAddressType[];
}
