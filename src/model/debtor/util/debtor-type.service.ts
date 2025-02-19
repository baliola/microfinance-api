import { TransactionType, WalletAddressType } from '../../../utils/type/type';

export type RegistrationServiceType = {
  wallet_address: string;
  tx_hash: string;
  onchain_url: string;
};

export type LogActivityType = {
  wallet_address: WalletAddressType[] | null;
  status: TransactionType[] | null;
};

export type RemoveDebtorType = {
  tx_hash: string;
  onchain_url: string;
};
