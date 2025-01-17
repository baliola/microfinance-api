import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class DelegationApprovalDTO {
  @ApiProperty({
    description: 'Unique number for verification access.',
    example: 123456,
  })
  @IsString()
  nik: string;

  @ApiProperty({
    description: 'Unique wallet address from consumer.',
    example: '0x...',
  })
  @IsString()
  consumer_wallet_address: string;

  @ApiProperty({
    description: 'boolean status of verification.',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  is_verified?: boolean = false;
}
