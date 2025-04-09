import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ProcessActionResponseDTO {
  @ApiProperty({
    description: 'Transaction Hash.',
    example: '0x...',
  })
  @IsString()
  tx_hash: `0x${string}`;

  @ApiProperty({
    description: 'Base URL for the Onchain Registry API.',
    example: '...',
  })
  onchain_url: string;
}
