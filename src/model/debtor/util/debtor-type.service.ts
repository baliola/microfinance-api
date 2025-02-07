import { TransactionType, WalletAddressType } from '../../../utils/type/type';

export type RegistrationServiceType = {
  wallet_address: string;
  tx_hash: string;
};

export type LogActivityType = {
  wallet_address: WalletAddressType[];
  status: TransactionType[];
};
