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
  transaction_hash: `0x${string}`;
}
