import {
  TransactionCommonType,
  TransactionType,
  WalletAddressType,
} from 'src/utils/type/type';
import {
  AddDebtorToCreditorType,
  CreateDelegationType,
  DelegationApprovalType,
  PurchasePackageType,
  RegistrationServiceType,
  RemoveCreditorType,
} from './creditor-type.service';

export interface ICreditorService {
  registration(
    creditor_code: string,
    creditor_name?: string,
    institution_code?: string,
    institution_name?: string,
    approval_date?: string,
    signer_name?: string,
    signer_position?: string,
  ): Promise<RegistrationServiceType>;
  delegationApproval(
    nik: string,
    is_approve: boolean,
    consumer_code: string,
    provider_code: string,
  ): Promise<DelegationApprovalType>;
  getStatusCreditorDelegation(
    nik: string,
    creditor_wallet_address: WalletAddressType,
  ): Promise<TransactionType>;
  createDelegation(
    consumer_address: `0x${string}`,
    nik: string,
    consumer_code: string,
    provider_code: string,
    request_id?: string,
    transaction_id?: string,
    referenced_id?: string,
    request_data?: string,
  ): Promise<CreateDelegationType>;
  addDebtorToCreditor(
    creditor_address: `0x${string}`,
    debtor_nik: string,
    creditor_code: string,
    name: string,
    creditor_name: string,
    application_date: string,
    approval_date: string,
    url_KTP: string,
    url_approval: string,
  ): Promise<AddDebtorToCreditorType>;
  purchasePackage(
    creditor_address: `0x${string}`,
    institution_code: string,
    purchase_date: string,
    invoice_number: string,
    package_id: number,
    quantity: number,
    start_date: string,
    end_date: string,
    quota: number,
  ): Promise<PurchasePackageType>;
  getCreditor(creditor_code: string): Promise<WalletAddressType | null>;
  removeCreditor(creditor_code: string): Promise<RemoveCreditorType>;
  getActiveCreditorByStatus(
    debtor_nik: string,
    status: TransactionCommonType,
  ): Promise<any>;
}
