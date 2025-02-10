import { ApiProperty } from '@nestjs/swagger';

export class RemoveDebtorResponseDTO {
  @ApiProperty({
    description: 'Transaction hash.',
    example: '...',
  })
  tx_hash: string;

  @ApiProperty({
    description: 'Base URL for the Onchain Registry API.',
    example: '...',
  })
  onchain_url: string;
}
