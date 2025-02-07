import { TransactionType, WalletAddressType } from 'src/utils/type/type';
import {
  AddDebtorToCreditorType,
  CreateDelegationType,
  DelegationApprovalType,
  RegistrationServiceType,
} from './creditor-type.service';

export interface ICreditorService {
  registration(nik: string): Promise<RegistrationServiceType>;
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
    nik: string,
    consumer_code: string,
    provider_code: string,
  ): Promise<CreateDelegationType>;
  addDebtorToCreditor(
    debtor_nik: string,
    creditor_code: string,
    name: string,
    creditor_name: string,
    application_date: string,
    approval_date: string,
    url_KTP: string,
    url_approval: string,
  ): Promise<AddDebtorToCreditorType>;
}
