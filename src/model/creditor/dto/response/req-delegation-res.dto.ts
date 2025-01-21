import { ApiProperty } from '@nestjs/swagger';
import { TransactionRequestType } from 'src/utils/type';

export class ReqDelegationResponseDTO {
  @ApiProperty({
    description: 'Status of request delegation.',
    example: 'PENDING',
  })
  status: TransactionRequestType;

  @ApiProperty({
    description: 'Transaction hash of the transaction.',
    example: '0x123abc...',
  })
  transaction_hash: `0x${string}`;
}
