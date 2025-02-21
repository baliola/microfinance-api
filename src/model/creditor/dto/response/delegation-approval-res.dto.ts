import { ApiProperty } from '@nestjs/swagger';
import { TransactionResponseType } from 'src/utils/type/type';

export class DelegationApprovalResponseDTO {
  @ApiProperty({
    description: 'Status of request delegation.',
    example: 'APPROVED',
  })
  status: TransactionResponseType;

  @ApiProperty({
    description: 'Transaction hash of the transaction.',
    example: '0x123abc...',
  })
  tx_hash: `0x${string}`;

  @ApiProperty({
    description: 'Base URL for the Onchain Registry API.',
    example: '...',
  })
  onchain_url: string;
}
