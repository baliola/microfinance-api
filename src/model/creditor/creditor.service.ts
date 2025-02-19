import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ICreditorService } from './util/creditor.service.interface';
import {
  TransactionCommonType,
  TransactionResponseType,
  TransactionType,
  TypeKey,
  WalletAddressType,
} from '../../utils/type/type';
import { EthersService } from '../../providers/ethers/ethers';
import {
  AddDebtorToCreditorType,
  CreateDelegationType,
  DelegationApprovalType,
  PurchasePackageType,
  RegistrationServiceType,
  RemoveCreditorType,
} from './util/creditor-type.service';
import { VaultService } from '../../providers/vault/vault';
import { ConfigService } from '@nestjs/config';
import { decrypt, encrypt } from '../../utils/crypto';
import {
  convertToEnumValue,
  getTransactionType,
} from '../../utils/function/get-status-delegation';
import { ContractTransactionReceipt } from 'ethers';
@Injectable()
export class CreditorService implements ICreditorService {
  constructor(
    private readonly ethersService: EthersService,
    private readonly logger: Logger,
    private readonly vaultService: VaultService,
    private readonly configService: ConfigService,
  ) {}

  async registration(
    creditor_code: string,
    institution_code?: string,
    institution_name?: string,
    approval_date?: string,
    signer_name?: string,
    signer_position?: string,
  ): Promise<RegistrationServiceType> {
    try {
      const { privateKey, address } = this.ethersService.generateHDNodeWallet();
      const wallet =
        this.ethersService.generateWalletWithPrivateKey(privateKey);

      let tx_hash: ContractTransactionReceipt;
      if (
        institution_code &&
        institution_name &&
        approval_date &&
        signer_name &&
        signer_position
      ) {
        tx_hash = await this.ethersService.addCreditorWithEvent(
          creditor_code,
          wallet,
          institution_code,
          institution_name,
          approval_date,
          signer_name,
          signer_position,
        );
      } else {
        tx_hash = await this.ethersService.addCreditor(creditor_code, wallet);
      }

      const secret = this.configService.get<string>('CRYPTO_SECRET');

      const encryptedData = encrypt(wallet.privateKey, secret);

      await this.vaultService.storePrivateKey(
        encryptedData,
        address as `0x${string}`,
        TypeKey.CREDITOR,
      );
      const onchain_url = `${this.configService.get<string>('ONCHAIN_URL')}${tx_hash.hash}`;

      return {
        wallet_address: wallet.address,
        tx_hash: tx_hash.hash,
        onchain_url,
      };
    } catch (error: any) {
      this.logger.error(error);
      if (
        error.code === 'CALL_EXCEPTION' &&
        error.shortMessage.includes('execution reverted (unknown custom error)')
      ) {
        throw new BadRequestException('Creditor already exist.');
      }
      throw error;
    }
  }

  async delegationApproval(
    nik: string,
    is_approve: boolean,
    consumer_code: string,
    provider_code: string,
  ): Promise<DelegationApprovalType> {
    try {
      let tx_hash: any;
      let status: TransactionResponseType;

      if (is_approve && is_approve === true) {
        tx_hash = await this.ethersService.approveDelegation(
          nik,
          consumer_code,
          provider_code,
          1,
        );

        status = 'APPROVED';
      } else {
        tx_hash = await this.ethersService.approveDelegation(
          nik,
          consumer_code,
          provider_code,
          0,
        );
        status = 'REJECTED';
      }

      const onchain_url = `${this.configService.get<string>('ONCHAIN_URL')}${tx_hash.hash}`;

      return { tx_hash: tx_hash.hash, status, onchain_url };
    } catch (error: any) {
      this.logger.error(error);
      if (error.action === 'estimateGas') {
        throw new BadRequestException(
          'Providers are unable to approve the request due to an estimate gas issue or the application status is not pending.',
        );
      }
      throw error;
    }
  }

  async getStatusCreditorDelegation(
    nik: string,
    creditor_code: string,
  ): Promise<TransactionType> {
    try {
      const tx = await this.ethersService.getStatusDelegation(
        nik,
        creditor_code,
      );
      const statusTx = getTransactionType(tx);

      return statusTx;
    } catch (error: any) {
      this.logger.error(error);
      if (error.reason === 'NotEligible()') {
        throw new BadRequestException(
          'Creditor Code not eligible to check status delegation.',
        );
      }
      if (error.reason === 'NikNeedRegistered()') {
        throw new BadRequestException('NIK need to be registered first.');
      }
      throw error;
    }
  }

  async createDelegation(
    nik: string,
    consumer_code: string,
    provider_code: string,
    request_id?: string,
    transaction_id?: string,
    referenced_id?: string,
    request_date?: string,
  ): Promise<CreateDelegationType> {
    try {
      let tx: any;
      if (request_id && transaction_id && referenced_id && request_date) {
        tx = await this.ethersService.requestDelegationWithEvent(
          nik,
          consumer_code,
          provider_code,
          request_id,
          transaction_id,
          referenced_id,
          request_date,
        );
      } else {
        tx = await this.ethersService.requestDelegation(
          nik,
          consumer_code,
          provider_code,
        );
      }

      const onchain_url = `${this.configService.get<string>('ONCHAIN_URL')}${tx.hash}`;

      return {
        nik: tx.nik,
        request_id: tx.request_id,
        consumer_code: tx.consumer_code,
        provider_code: tx.provider_code,
        transaction_id: tx.transaction_id,
        reference_id: tx.reference_id,
        request_date: tx.request_date,
        tx_hash: tx.hash,
        onchain_url,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
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
      const tx = await this.ethersService.addDebtorToCreditor(
        debtor_nik,
        creditor_code,
        name,
        creditor_name,
        application_date,
        approval_date,
        url_KTP,
        url_approval,
      );

      const onchain_url = `${this.configService.get<string>('ONCHAIN_URL')}${tx.hash}`;

      return {
        debtor_nik: tx.nik,
        creditor_code: tx.creditor_code,
        name: tx.name,
        creditor_name: tx.creditor_name,
        application_date: tx.application_date,
        approval_date: tx.approval_date,
        url_KTP: tx.url_ktp,
        url_approval: tx.url_approval,
        tx_hash: tx.hash,
        onchain_url,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async removeCreditor(creditor_code: string): Promise<RemoveCreditorType> {
    try {
      const { hash } = await this.ethersService.removeCreditor(creditor_code);
      const onchain_url = `${this.configService.get<string>('ONCHAIN_URL')}${hash}`;

      return { tx_hash: hash, onchain_url };
    } catch (error: any) {
      this.logger.error(error);
      if (error.code) {
        throw new BadRequestException('Creditor already removed.');
      }
    }
  }

  async purchasePackage(
    creditor_address: `0x${string}`,
    institution_code: string,
    purchase_date: string,
    invoice_number: string,
    package_id: number,
    quantity: number,
    start_date: string,
    end_date: string,
    quota: number,
  ): Promise<PurchasePackageType> {
    try {
      const privateKey = await this.vaultService.readPrivateKey(
        creditor_address,
        TypeKey.CREDITOR,
      );
      const secret = this.configService.get<string>('CRYPTO_SECRET');
      const decryptedPrivateKey = decrypt(privateKey, secret);

      const creditor_wallet =
        this.ethersService.generateWalletWithPrivateKey(decryptedPrivateKey);

      const tx_hash = await this.ethersService.purchasePackage(
        creditor_wallet,
        institution_code,
        purchase_date,
        invoice_number,
        package_id,
        quantity,
        start_date,
        end_date,
        quota,
      );
      const onchain_url = `${this.configService.get<string>('ONCHAIN_URL')}${tx_hash.hash}`;

      return { tx_hash: tx_hash.hash, onchain_url };
    } catch (error) {
      throw error;
    }
  }

  async getCreditor(creditor_code: string): Promise<WalletAddressType | null> {
    try {
      const tx = await this.ethersService.getCreditor(creditor_code);
      if (tx === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      return tx;
    } catch (error) {
      throw error;
    }
  }

  async getActiveCreditorByStatus(
    debtor_nik: string,
    status: TransactionCommonType,
  ): Promise<WalletAddressType[]> {
    try {
      const convertedStatus = convertToEnumValue(status);
      const data = await this.ethersService.getActiveCreditorByStatus(
        debtor_nik,
        convertedStatus,
      );

      console.log('data: ', data);
      return data;
    } catch (error: any) {
      this.logger.error(error);
      if (error.reason === 'NikNeedRegistered()') {
        throw new BadRequestException('NIK need to be registered first.');
      }
      throw error;
    }
  }
}
