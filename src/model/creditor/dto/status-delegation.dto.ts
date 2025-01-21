import { IsString } from 'class-validator';

export class StatusProviderDelegationDTO {
  @IsString()
  nik: string;

  @IsString()
  creditor_wallet_address: string;
}
