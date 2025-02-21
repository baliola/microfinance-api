import { ApiProperty } from '@nestjs/swagger';

export class ReqDelegationResponseDTO {
  @ApiProperty({
    description: 'Customer National Identity.',
    example: '123...',
  })
  nik: string;

  @ApiProperty({
    description: 'Request ID.',
    example: '...',
  })
  request_id: string;

  @ApiProperty({
    description: 'Creditor Consumer Code.',
    example: '0x123abc...',
  })
  creditor_consumer_code: `0x${string}`;

  @ApiProperty({
    description: 'Creditor Provider Code.',
    example: '0x123abc...',
  })
  creditor_provider_code: `0x${string}`;

  @ApiProperty({
    description: 'Transaction ID.',
    example: '...',
  })
  transaction_id: string;

  @ApiProperty({
    description: 'Reference ID.',
    example: '...',
  })
  reference_id: string;

  @ApiProperty({
    description: 'Date of Request.',
    example: '...',
  })
  request_date: string;

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
