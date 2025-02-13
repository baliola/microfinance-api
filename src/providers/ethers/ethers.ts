import {
  Injectable,
  InternalServerErrorException,
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
  verifyTypedData,
} from 'ethers';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { IsApprove } from 'src/model/creditor/util/creditor-type.service';

@Injectable()
export class EthersService implements OnModuleInit, OnModuleDestroy {
  private provider: JsonRpcProvider;
  private wallet: Wallet;
  private contract: Contract;
  private readonly abiCoder = AbiCoder.defaultAbiCoder();

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.onModuleInit();
  }

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
    if (this.provider) {
      this.provider.destroy();
    }
    this.provider = null;
    this.wallet = null;
  }

  generateWallet(): HDNodeWallet | null {
    try {
      return Wallet.createRandom();
    } catch (error: any) {
      this.logger.error(`Failed to generate wallet: ${error.message}`);
      throw null;
    }
  }

  generateWalletWithPrivateKey(private_key: string): Wallet | null {
    try {
      return new Wallet(private_key);
    } catch (error: any) {
      this.logger.error(`Failed to generate wallet: ${error.message}`);
      return null;
    }
  }

  /**
   * ✅ Generate EIP-712 Domain
   */
  private async getEIP712Domain() {
    const network = await this.provider.getNetwork();
    return {
      name: 'DataSharing',
      version: '1',
      chainId: network.chainId,
      verifyingContract: this.contract.target.toString(),
    };
  }

  /**
   * ✅ Sign MetaTransaction using EIP-712
   */
  protected async signMetaTransaction(
    from: Wallet,
    functionCall: string,
  ): Promise<{
    message: { from: Wallet; nonce: bigint; functionCall: string };
    signature: string;
  }> {
    const current_nonce = BigInt(await this.contract.nonces(from));
    const domain = await this.getEIP712Domain();

    const message = {
      from,
      nonce: current_nonce,
      functionCall,
    };

    const signature = await from.signTypedData(
      domain,
      {
        MetaTransaction: [
          { name: 'from', type: 'address' },
          { name: 'nonce', type: 'uint256' },
          { name: 'functionCall', type: 'bytes' },
        ],
      },
      message,
    );

    return { message, signature };
  }

  /**
   * ✅ Execute MetaTransaction with EIP-712 Signature
   */
  private async executeMetaTransaction(
    signerAddress: Wallet,
    functionCall: string,
  ) {
    try {
      const { signature, message } = await this.signMetaTransaction(
        signerAddress,
        functionCall,
      );

      // ✅ Verify signature before execution
      const domain = await this.getEIP712Domain();
      const recoveredSigner = verifyTypedData(
        domain,
        {
          MetaTransaction: [
            { name: 'from', type: 'address' },
            { name: 'nonce', type: 'uint256' },
            { name: 'functionCall', type: 'bytes' },
          ],
        },
        message,
        signature,
      );

      if (recoveredSigner !== signerAddress.address) {
        throw new InternalServerErrorException(
          'Invalid EIP-712 Signature: Signer does not match!',
        );
      }

      // ✅ Execute MetaTransaction on contract
      const tx = await this.contract.executeMetaTransaction(
        message.from,
        message.nonce,
        message.functionCall,
        signature,
      );

      return await tx.wait();
    } catch (error: any) {
      this.logger.error(
        `Meta Transaction Error for ${signerAddress}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * ✅ Add Creditor using MetaTransaction
   */
  async addCreditor(creditor_code: string, creditor_address: `0x${string}`) {
    try {
      const functionCall = this.contract.interface.encodeFunctionData(
        'addCreditor(bytes32,address)',
        [
          keccak256(this.abiCoder.encode(['string'], [creditor_code])),
          creditor_address,
        ],
      );

      return await this.executeMetaTransaction(this.wallet, functionCall);
    } catch (error: any) {
      const decodedError = this.contract.interface.parseError(error.data);
      this.logger.error(decodedError);
      throw decodedError;
    }
  }

  /**
   * ✅ Add Creditor with event emit triggered using MetaTransaction
   */
  async addCreditorWithEvent(
    creditor_code: string,
    creditor_address: `0x${string}`,
    institution_code: string,
    institution_name: string,
    approval_date: string,
    signer_name: string,
    signer_position: string,
  ) {
    try {
      const functionCall = this.contract.interface.encodeFunctionData(
        'addCreditor(address,bytes32,string,string,string,string,string)',
        [
          creditor_address,
          keccak256(this.abiCoder.encode(['string'], [creditor_code])),
          institution_code,
          institution_name,
          approval_date,
          signer_name,
          signer_position,
        ],
      );

      return await this.executeMetaTransaction(this.wallet, functionCall);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /**
   * ✅ Add Debtor using MetaTransaction
   */
  async addDebtor(nik: string, debtor_address: `0x${string}`) {
    try {
      const functionCall = this.contract.interface.encodeFunctionData(
        'addDebtor(bytes32,address)',
        [keccak256(this.abiCoder.encode(['string'], [nik])), debtor_address],
      );

      return await this.executeMetaTransaction(this.wallet, functionCall);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /**
   * ✅ Remove creditor using MetaTransaction
   */
  async removeCreditor(creditor_code: string) {
    try {
      const functionCall = this.contract.interface.encodeFunctionData(
        'removeCreditor(bytes32)',
        [keccak256(this.abiCoder.encode(['string'], [creditor_code]))],
      );

      return await this.executeMetaTransaction(this.wallet, functionCall);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /**
   * ✅ Remove debtor using MetaTransaction
   */
  async removeDebtor(nik: string) {
    try {
      const functionCall = this.contract.interface.encodeFunctionData(
        'removeDebtor(bytes32)',
        [keccak256(this.abiCoder.encode(['string'], [nik]))],
      );

      return await this.executeMetaTransaction(this.wallet, functionCall);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getLogData(nik: string) {
    try {
      const dataLog = await this.contract.getDebtorDataActiveCreditors(
        keccak256(this.abiCoder.encode(['string'], [nik])),
      );

      return dataLog;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getStatusRequest(nik: string, creditor_code: string) {
    try {
      const status = await this.contract.getStatusRequest(
        keccak256(this.abiCoder.encode(['string'], [nik])),
        keccak256(this.abiCoder.encode(['string'], [creditor_code])),
      );

      return status;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /**
   * ✅ Request Delegation using MetaTransaction
   */
  async requestDelegation(
    consumer_address: Wallet,
    nik: string,
    consumer_code: string,
    provider_code: string,
  ) {
    try {
      const functionCall = this.contract.interface.encodeFunctionData(
        'requestDelegation(bytes32,bytes32,bytes32)',
        [
          keccak256(this.abiCoder.encode(['string'], [nik])),
          keccak256(this.abiCoder.encode(['string'], [consumer_code])),
          keccak256(this.abiCoder.encode(['string'], [provider_code])),
        ],
      );

      return await this.executeMetaTransaction(consumer_address, functionCall);
    } catch (error) {
      console.log(error);
      this.logger.error(error);
      throw error;
    }
  }

  /**
   * ✅ Request Delegation using MetaTransaction
   */
  async requestDelegationWithEvent(
    consumer_wallet: Wallet,
    nik: string,
    consumer_code: string,
    provider_code: string,
    request_id: string,
    transaction_id: string,
    referenced_id: string,
    request_data: string,
  ) {
    try {
      const functionCall = this.contract.interface.encodeFunctionData(
        'requestDelegation(bytes32,bytes32,bytes32,string,string,string,string)',
        [
          keccak256(this.abiCoder.encode(['string'], [nik])),
          keccak256(this.abiCoder.encode(['string'], [consumer_code])),
          keccak256(this.abiCoder.encode(['string'], [provider_code])),
          request_id,
          transaction_id,
          referenced_id,
          request_data,
        ],
      );

      return await this.executeMetaTransaction(consumer_wallet, functionCall);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /**
   * ✅ Approve Delegation using MetaTransaction
   */
  async approveDelegation(
    provider_wallet: Wallet,
    customer_nik: string,
    consumer: string,
    provider: string,
    is_approve: IsApprove,
  ) {
    try {
      const functionCall = this.contract.interface.encodeFunctionData(
        'delegate(bytes32,bytes32,bytes32,uint8)',
        [
          keccak256(this.abiCoder.encode(['string'], [customer_nik])),
          keccak256(this.abiCoder.encode(['string'], [consumer])),
          keccak256(this.abiCoder.encode(['string'], [provider])),
          is_approve,
        ],
      );

      return await this.executeMetaTransaction(provider_wallet, functionCall);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getCreditor(creditor_code: string) {
    try {
      const creditorAddress = await this.contract.getCreditor(
        keccak256(this.abiCoder.encode(['string'], [creditor_code])),
      );

      return creditorAddress;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async purchasePackage(
    creditor_wallet: Wallet,
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
      const functionCall = this.contract.interface.encodeFunctionData(
        'purchasePackage(string,string,string,uint256,uint256,string,string,uint256)',
        [
          institution_code,
          purchase_date,
          invoice_number,
          package_id,
          quantity,
          start_date,
          end_date,
          quota,
        ],
      );

      return await this.executeMetaTransaction(creditor_wallet, functionCall);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async addDebtorToCreditor(
    debtor_nik: string,
    creditor_code: string,
    debtor_name: string,
    creditor_name: string,
    application_date: string,
    approval_date: string,
    url_KTP: string,
    url_approval: string,
  ) {
    try {
      const functionCall = this.contract.interface.encodeFunctionData(
        'addDebtorToCreditor(bytes32,bytes32,string,string,string,string,string,string)',
        [
          keccak256(this.abiCoder.encode(['string'], [debtor_nik])),
          keccak256(this.abiCoder.encode(['string'], [creditor_code])),
          debtor_name,
          creditor_name,
          application_date,
          approval_date,
          url_KTP,
          url_approval,
        ],
      );

      return await this.executeMetaTransaction(this.wallet, functionCall);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
