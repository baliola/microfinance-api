import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from 'src/utils/type/type';

export class StatusDelegationResponseDTO {
  @ApiProperty({
    description: 'Status of request delegation.',
    example: 'PENDING',
  })
  status: TransactionType;
}
