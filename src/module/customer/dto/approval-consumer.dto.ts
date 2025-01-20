import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class ApprovalConsumerDTO {
  @ApiProperty({
    description: 'Unique number for verification access.',
    example: 123456,
  })
  @IsNumber()
  otp: number;

  @ApiProperty({
    description: 'boolean status of verification.',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  is_verified?: boolean = false;
}
