import { IsString } from 'class-validator';
import { WalletAddressType } from 'src/utils/type/type';

export class StatusProviderDelegationDTO {
  @IsString()
  nik: string;

  @IsString()
  creditor_wallet_address: WalletAddressType;
}
