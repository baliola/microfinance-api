import { WalletAddressType } from 'src/utils/type/type';

export interface ICreditorService {
  registration(): Promise<void>;
  delegationApproval(
    nik: string,
    is_approve: boolean,
    creditor_wallet_address: WalletAddressType,
  ): Promise<void>;
  getStatusCreditorDelegation(
    nik: string,
    creditor_wallet_address: WalletAddressType,
  ): Promise<void>;
  createDelegation(
    nik: string,
    creditor_wallet_address: WalletAddressType,
  ): Promise<void>;
}
