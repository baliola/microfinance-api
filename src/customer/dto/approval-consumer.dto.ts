import { IsBoolean, IsNumber } from 'class-validator';

export class ApprovalConsumerDTO {
  @IsNumber()
  otp: number;

  @IsBoolean()
  is_verified: boolean;
}
