import { ApiProperty } from '@nestjs/swagger';

export class RemoveCreditorResponseDTO {
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
