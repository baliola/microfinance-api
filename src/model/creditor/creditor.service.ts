import { Injectable } from '@nestjs/common';
import { ICreditorService } from './util/creditor.service.interface';
import { WalletAddressType } from 'src/utils/type/type';

@Injectable()
export class CreditorService implements ICreditorService {
  async registration(): Promise<void> {}

  async delegationApproval(
    nik: string,
    is_approve: boolean,
    creditor_wallet_address: WalletAddressType,
  ): Promise<void> {}

  async getStatusCreditorDelegation(
    nik: string,
    creditor_wallet_address: WalletAddressType,
  ): Promise<void> {}

  async createDelegation(
    nik: string,
    creditor_wallet_address: WalletAddressType,
  ): Promise<void> {}
}
