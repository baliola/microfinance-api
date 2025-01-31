import { Injectable, Logger } from '@nestjs/common';
import { ICreditorService } from './util/creditor.service.interface';
import { TransactionType } from 'src/utils/type/type';
import { EthersService } from '../../providers/ethers/ethers';
import {
  AddDebtorToCreditorType,
  CreateDelegationType,
  DelegationApprovalType,
  RegistrationServiceType,
} from './util/creditor-type.service';

@Injectable()
export class CreditorService implements ICreditorService {
  constructor(
    private readonly ethersService: EthersService,
    private readonly logger: Logger,
  ) {}

  async registration(nik: string): Promise<RegistrationServiceType> {
    try {
      const { address } = this.ethersService.generateWallet();
      const tx_hash = await this.ethersService.addCreditor(
        nik,
        address as `0x${string}`,
      );

      return { wallet_address: address, tx_hash };
    } catch (error) {
      this.logger.error(error);
    }
  }

  async delegationApproval(
    nik: string,
    is_approve: boolean,
    consumer_code: string,
    provider_code: string,
  ): Promise<DelegationApprovalType> {
    try {
      let tx: any;
      if (is_approve) {
        tx = await this.ethersService.approveDelegation(
          nik,
          consumer_code,
          provider_code,
          1,
        );
      } else {
        tx = await this.ethersService.approveDelegation(
          nik,
          consumer_code,
          provider_code,
          0,
        );
      }

      return tx;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async getStatusCreditorDelegation(
    nik: string,
    creditor_code: string,
  ): Promise<TransactionType> {
    try {
      const tx = await this.ethersService.getStatusRequest(nik, creditor_code);

      return tx;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async createDelegation(
    nik: string,
    consumer_code: string,
    provider_code: string,
  ): Promise<CreateDelegationType> {
    try {
      const tx = await this.ethersService.requestDelegation(
        nik,
        consumer_code,
        provider_code,
      );

      return tx;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async addDebtorToCreditor(
    debtor_nik: string,
    creditor_code: string,
    name: string,
    creditor_name: string,
    application_date: string,
    approval_date: string,
    url_KTP: string,
    url_approval: string,
  ): Promise<AddDebtorToCreditorType> {
    try {
      const tx = this.ethersService.addDebtorToCreditor(
        debtor_nik,
        creditor_code,
        name,
        creditor_name,
        application_date,
        approval_date,
        url_KTP,
        url_approval,
      );

      return tx;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
