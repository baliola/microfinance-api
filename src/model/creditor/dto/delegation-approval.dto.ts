import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class DelegationApprovalDTO {
  @ApiProperty({
    description: 'National Identification number from Customer.',
    example: '123...',
  })
  @IsString()
  customer_nik: string;

  @ApiProperty({
    description: 'Approval status (true or false).',
    example: true,
  })
  @IsBoolean()
  is_approve: boolean;

  @ApiProperty({
    description: 'Unique code from creditor (consumer).',
    example: '0x...',
  })
  @IsString()
  consumer_code: string;

  @ApiProperty({
    description: 'Unique code from creditor (provider).',
    example: '0x...',
  })
  @IsString()
  provider_code: string;
}
