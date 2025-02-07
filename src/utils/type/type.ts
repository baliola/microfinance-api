export type TransactionType = 'PENDING' | 'APPROVED' | 'REJECTED';
export type TransactionRequestType = 'PENDING';
export type TransactionResponseType = 'APPROVED' | 'REJECTED';

export type WalletAddressType = `0x${string}`;

export enum VaultPrefix {
  VAULT = 'secret',
  PK_PATH = 'data/pk',
}

export enum TypeKey {
  DEBTOR = 'debtor',
  CREDITOR = 'creditor',
}
