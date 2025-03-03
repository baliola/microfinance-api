import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class DelegationApprovalDTO {
  @ApiProperty({
    description: 'National Identification number from Customer.',
    example: '123...',
  })
  @IsString()
  debtor_nik: string;

  @ApiProperty({
    description: 'Approval status (true or false).',
    example: true,
  })
  @IsBoolean()
  is_approve: boolean;

  @ApiProperty({
    description: 'Unique code from creditor (consumer).',
    example: '...',
  })
  @IsString()
  creditor_consumer_code: string;

  @ApiProperty({
    description: 'Unique code from creditor (provider).',
    example: '...',
  })
  @IsString()
  creditor_provider_code: string;
}
