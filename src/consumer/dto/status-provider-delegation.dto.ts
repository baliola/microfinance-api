import { IsString } from 'class-validator';

export class StatusProviderDelegationDTO {
  @IsString()
  nik: string;

  @IsString()
  provider_wallet_address: string;
}
