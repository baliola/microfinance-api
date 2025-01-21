import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from 'src/utils/type';

export class LogActivityResponseDTO {
  @ApiProperty({
    description: 'Creditor who access the data',
    example: '0x...',
  })
  creditor: string;

  @ApiProperty({
    description: 'Status of the transaction (PENDING, APPROVED, REJECTED)',
    example: 'PENDING',
  })
  status: TransactionType;

  @ApiProperty({
    description: 'Time the data accessed.',
    example: 'YYYY-MM-DD',
  })
  accessed_at: Date;
}
