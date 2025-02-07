export type RegistrationServiceType = {
  wallet_address: string;
  tx_hash: string;
};

export type DelegationApprovalType = {
  tx_hash: string;
};

export type AddDebtorToCreditorType = {
  debtor_nik: string;
  creditor_code: string;
  name: string;
  creditor_name: string;
  application_date: string;
  approval_date: string;
  url_KTP: string;
  url_approval: string;
  tx_hash: string;
};

export type CreateDelegationType = {
  nik: string;
  request_id: string;
  creditor_consumer_code: `0x${string}`;
  creditor_provider_code: `0x${string}`;
  transaction_id: string;
  reference_id: string;
  request_date: string;
  tx_hash: string;
};

export enum IsApprove {
  REJECTED = 0,
  APPROVED = 1,
}

export enum StatusLogActivity {
  REJECTED = 0,
  APPROVED = 1,
  PENDING = 2,
}
