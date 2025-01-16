import { IsBoolean, IsString } from 'class-validator';

export class DelegationApprovalDTO {
  @IsString()
  nik: string;

  @IsBoolean()
  is_verified: boolean;

  @IsString()
  consumer_wallet_address: string;
}
