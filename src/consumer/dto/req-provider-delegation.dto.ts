import { IsString } from 'class-validator';

export class ReqProviderDelegationDTO {
  @IsString()
  nik: string;

  @IsString()
  provider_wallet_address: string;
}
