import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Wallet,
  keccak256,
  JsonRpcProvider,
  Contract,
  AbiCoder,
  HDNodeWallet,
} from 'ethers';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { IsApprove } from 'src/model/creditor/util/creditor-type.service';

@Injectable()
export class EthersService implements OnModuleInit, OnModuleDestroy {
  private provider: JsonRpcProvider;
  private wallet: Wallet;
  private contract: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  onModuleInit() {
    const rpcUrl = this.configService.get<string>('RPC_URL');
    if (!rpcUrl) {
      throw new Error('RPC_URL is not defined in the environment variables');
    }

    this.provider = new JsonRpcProvider(rpcUrl);
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    if (privateKey) {
      this.wallet = new Wallet(privateKey, this.provider);
    }

    Logger.log(`Wallet address: ${this.wallet.address}`);

    const abiPath = path.join(
      process.cwd(),
      'src',
      'artifact',
      'DataSharing.json',
    );
    const abi = JSON.parse(fs.readFileSync(abiPath, 'utf-8')).abi;

    const contractAddress =
      this.configService.get<`0x${string}`>('CONTRACT_ADDRESS');

    this.contract = new Contract(contractAddress, abi, this.wallet);
  }

  onModuleDestroy() {
    this.provider = null;
    this.wallet = null;
  }

  generateWallet(): HDNodeWallet {
    try {
      const wallet = Wallet.createRandom();

      return wallet;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async addCreditor(creditor_code: string, creditor_address: `0x${string}`) {
    try {
      const abiCoder = new AbiCoder();
      const tx = await this.contract.addCreditor(
        keccak256(abiCoder.encode(['string'], [creditor_code])),
        creditor_address,
      );
      await tx.wait();

      return tx.hash;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async addDebtor(nik: string, debtor_address: `0x${string}`) {
    try {
      const abiCoder = new AbiCoder();
      const tx = await this.contract.addDebtor(
        keccak256(abiCoder.encode(['string'], [nik])),
        debtor_address,
      );

      await tx.wait();

      return tx.hash;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async getLogData(nik: string) {
    try {
      const tx = await this.contract.getDebtorDataActiveCreditors(
        keccak256(nik),
      );

      await tx.wait();
      return tx;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async getStatusRequest(nik: string, creditor_code: string) {
    try {
      const tx = await this.contract.getStatusRequest(
        keccak256(nik),
        keccak256(creditor_code),
      );

      await tx.wait();
      return tx;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async requestDelegation(
    nik: string,
    consumer_code: string,
    provider_code: string,
  ) {
    try {
      const tx = await this.contract.requestDelegation(
        keccak256(nik),
        keccak256(consumer_code),
        keccak256(provider_code),
      );

      await tx.wait();

      return tx;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async approveDelegation(
    customer_nik: string,
    consumer: string,
    provider: string,
    is_approve: IsApprove,
  ) {
    try {
      const tx = await this.contract.delegate(
        keccak256(customer_nik),
        keccak256(consumer),
        keccak256(provider),
        is_approve,
      );

      await tx.wait();

      return tx;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async getCreditor(creditor_code: string) {
    try {
      const creditorAddress = await this.contract.getCreditor(
        keccak256(creditor_code),
      );

      return creditorAddress;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async purchasePackage(
    institution_code: string,
    purchase_date: string,
    invoice_number: string,
    package_id: number,
    quantity: number,
    start_date: string,
    end_date: string,
    quota: number,
  ) {
    try {
      const tx = await this.contract.purchasePackage(
        institution_code,
        purchase_date,
        invoice_number,
        package_id,
        quantity,
        start_date,
        end_date,
        quota,
      );
      await tx.wait();

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
  ) {
    try {
      const tx = await this.contract.addDebtorToCreditor(
        debtor_nik,
        creditor_code,
        name,
        creditor_name,
        application_date,
        approval_date,
        url_KTP,
        url_approval,
      );

      const receipt = tx.wait();
      const event = receipt.events?.find(
        (e: { event: string }) => e.event === 'DebtorAddedWithMetadata',
      );

      return {
        debtor_nik: event.args.nik,
        creditor_code: event.args.creditorCode,
        name: event.args.name,
        creditor_name: event.args.creditorName,
        application_date: event.args.applicationDate,
        approval_date: event.args.approvalDate,
        url_KTP: event.args.urlKTP,
        url_approval: event.args.urlApproval,
        tx_hash: receipt.hash,
      };
    } catch (error) {
      this.logger.error(error);
    }
  }
}
