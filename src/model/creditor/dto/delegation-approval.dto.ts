import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class DelegationApprovalDTO {
  @ApiProperty({
    description: 'National Identification number.',
    example: '123...',
  })
  @IsString()
  nik: string;

  @ApiProperty({
    description: 'Approval status (true or false).',
    example: true,
  })
  @IsBoolean()
  is_approve: boolean;

  @ApiProperty({
    description: 'Unique wallet address from creditor.',
    example: '0x...',
  })
  @IsString()
  creditor_walet_address: string;
}
