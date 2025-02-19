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
  ContractTransactionResponse,
  ContractTransactionReceipt,
} from 'ethers';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { IsApprove } from 'src/model/creditor/util/creditor-type.service';
import { StatusCreditorDelegation } from 'src/utils/enum';
import { WalletAddressType } from 'src/utils/type/type';

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

  generateHDNodeWallet(): HDNodeWallet | null {
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
    message: { from: string; nonce: bigint; functionCall: string };
    signature: string;
  }> {
    const current_nonce = BigInt(await this.contract.nonces(from.address));
    const domain = await this.getEIP712Domain();

    const message = {
      from: from.address,
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
   * ================== Creditor Section =====================
   */

  /**
   * ✅ Add Creditor using MetaTransaction
   */
  async addCreditor(
    creditor_code: string,
    creditor_address: Wallet,
  ): Promise<ContractTransactionReceipt> {
    try {
      const functionCall = this.contract.interface.encodeFunctionData(
        'addCreditor(bytes32,address)',
        [
          keccak256(this.abiCoder.encode(['string'], [creditor_code])),
          creditor_address.address,
        ],
      );

      return await this.executeMetaTransaction(this.wallet, functionCall);

      // Encode function call
    } catch (error: any) {
      if (!error.data) {
        this.logger.error('Error data is undefined:', error);
        throw error;
      }

      try {
        const decodedError = this.contract.interface.parseError(error.data);
        this.logger.error(decodedError);
        throw decodedError;
      } catch (parseError) {
        this.logger.error('Error parsing failed:', parseError);
        throw error;
      }
    }
  }

  /**
   * ✅ Add Creditor with event emit triggered using MetaTransaction
   */
  async addCreditorWithEvent(
    creditor_code: string,
    creditor_wallet: Wallet,
    institution_code: string,
    institution_name: string,
    approval_date: string,
    signer_name: string,
    signer_position: string,
  ): Promise<ContractTransactionReceipt> {
    try {
      const hashCreditorCode = keccak256(
        this.abiCoder.encode(['string'], [creditor_code]),
      );

      const functionCall = this.contract.interface.encodeFunctionData(
        'addCreditor(address,bytes32,string,string,string,string,string)',
        [
          creditor_wallet.address,
          hashCreditorCode,
          institution_code,
          institution_name,
          approval_date,
          signer_name,
          signer_position,
        ],
      );

      return await this.executeMetaTransaction(this.wallet, functionCall);
    } catch (error: any) {
      if (!error.data) {
        this.logger.error('Error data is undefined:', error);
        throw error;
      }

      try {
        const decodedError = this.contract.interface.parseError(error.data);
        this.logger.error(decodedError);
        throw decodedError;
      } catch (parseError) {
        this.logger.error('Error parsing failed:', parseError);
        throw error;
      }
    }
  }

  /**
   * ✅ Remove creditor using MetaTransaction
   */
  async removeCreditor(
    creditor_code: string,
  ): Promise<ContractTransactionResponse> {
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

  // wallet platform
  /**
   * ✅ Request Delegation using MetaTransaction
   */
  async requestDelegation(
    nik: string,
    consumer_code: string,
    provider_code: string,
  ) {
    try {
      const hashNik = keccak256(this.abiCoder.encode(['string'], [nik]));
      const hashConsumerCode = keccak256(
        this.abiCoder.encode(['string'], [consumer_code]),
      );
      const hashProviderCode = keccak256(
        this.abiCoder.encode(['string'], [provider_code]),
      );

      const functionCall = this.contract.interface.encodeFunctionData(
        'requestDelegation(bytes32,bytes32,bytes32)',
        [hashNik, hashConsumerCode, hashProviderCode],
      );

      return await this.executeMetaTransaction(this.wallet, functionCall);
    } catch (error: any) {
      if (!error.data) {
        this.logger.error('Error data is undefined:', error);
        throw error;
      }

      try {
        const decodedError = this.contract.interface.parseError(error.data);
        this.logger.error(decodedError);
        throw decodedError;
      } catch (parseError) {
        this.logger.error('Error parsing failed:', parseError);
        throw error;
      }
    }
  }

  /**
   * ✅ Request Delegation using MetaTransaction
   */
  async requestDelegationWithEvent(
    nik: string,
    consumer_code: string,
    provider_code: string,
    request_id: string,
    transaction_id: string,
    referenced_id: string,
    request_date: string,
  ) {
    try {
      const hashNik = keccak256(this.abiCoder.encode(['string'], [nik]));
      const hashConsumerCode = keccak256(
        this.abiCoder.encode(['string'], [consumer_code]),
      );
      const hashProviderCode = keccak256(
        this.abiCoder.encode(['string'], [provider_code]),
      );
      const functionCall = this.contract.interface.encodeFunctionData(
        'requestDelegation(bytes32,bytes32,bytes32,string,string,string,string)',
        [
          hashNik,
          hashConsumerCode,
          hashProviderCode,
          request_id,
          transaction_id,
          referenced_id,
          request_date,
        ],
      );

      return await this.executeMetaTransaction(this.wallet, functionCall);
    } catch (error: any) {
      if (!error.data) {
        this.logger.error('Error data is undefined:', error);
        throw error;
      }

      try {
        const decodedError = this.contract.interface.parseError(error.data);
        this.logger.error(decodedError);
        throw decodedError;
      } catch (parseError) {
        this.logger.error('Error parsing failed:', parseError);
        throw error;
      }
    }
  }

  /**
   * ✅ Approve Delegation using MetaTransaction
   */
  async approveDelegation(
    customer_nik: string,
    consumer_code: string,
    provider_code: string,
    is_approve: IsApprove,
  ) {
    try {
      const hashCustomerNIK = keccak256(
        this.abiCoder.encode(['string'], [customer_nik]),
      );
      const hashConsumerCode = keccak256(
        this.abiCoder.encode(['string'], [consumer_code]),
      );
      const hashProviderCode = keccak256(
        this.abiCoder.encode(['string'], [provider_code]),
      );

      const functionCall = this.contract.interface.encodeFunctionData(
        'delegate(bytes32,bytes32,bytes32,uint8)',
        [hashCustomerNIK, hashConsumerCode, hashProviderCode, is_approve],
      );

      return await this.executeMetaTransaction(this.wallet, functionCall);
    } catch (error: any) {
      if (!error.data) {
        this.logger.error('Error data is undefined:', error);
        throw error;
      }

      try {
        const decodedError = this.contract.interface.parseError(error.data);
        this.logger.error(decodedError);
        throw decodedError;
      } catch (parseError) {
        this.logger.error('Error parsing failed:', parseError);
        throw error;
      }
    }
  }

  async getCreditor(creditor_code: string) {
    try {
      const creditor = await this.contract.getCreditor(
        keccak256(this.abiCoder.encode(['string'], [creditor_code])),
      );

      return creditor;
    } catch (error: any) {
      if (!error.data) {
        this.logger.error('Error data is undefined:', error);
        throw error;
      }

      try {
        const decodedError = this.contract.interface.parseError(error.data);
        this.logger.error(decodedError);
        throw decodedError;
      } catch (parseError) {
        this.logger.error('Error parsing failed:', parseError);
        throw error;
      }
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
      const hashNik = keccak256(this.abiCoder.encode(['string'], [debtor_nik]));
      const hashCreditorCode = keccak256(
        this.abiCoder.encode(['string'], [creditor_code]),
      );

      const functionCall = this.contract.interface.encodeFunctionData(
        'addDebtorToCreditor(bytes32,bytes32,string,string,string,string,string,string)',
        [
          hashNik,
          hashCreditorCode,
          debtor_name,
          creditor_name,
          application_date,
          approval_date,
          url_KTP,
          url_approval,
        ],
      );

      return await this.executeMetaTransaction(this.wallet, functionCall);
    } catch (error: any) {
      this.logger.error(error);
      throw error;
    }
  }

  async getStatusDelegation(nik: string, creditor_code: string) {
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

  async getActiveCreditorByStatus(
    debtor_nik: string,
    status: StatusCreditorDelegation,
  ) {
    try {
      const data = await this.contract.getActiveCreditorsByStatus(
        keccak256(this.abiCoder.encode(['string'], [debtor_nik])),
        status,
      );

      return data;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /**
   *  ================== Debtor Section =====================
   */

  /**
   * ✅ Add Debtor using MetaTransaction
   */
  async addDebtor(
    nik: string,
    debtor_wallet: Wallet,
  ): Promise<ContractTransactionResponse> {
    try {
      const hashNik = keccak256(this.abiCoder.encode(['string'], [nik]));

      const functionCall = this.contract.interface.encodeFunctionData(
        'addDebtor(bytes32,address)',
        [hashNik, debtor_wallet.address],
      );

      const tx = await this.executeMetaTransaction(this.wallet, functionCall);
      return tx;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  /**
   * ✅ Remove debtor using MetaTransaction
   */
  async removeDebtor(nik: string): Promise<ContractTransactionReceipt> {
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

  /**
   * ✅ Get Log Data of Debtor
   */
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

  /**
   * ✅ Get Debtor Data
   */
  async getDebtor(nik: string): Promise<WalletAddressType> {
    try {
      const debtor = await this.contract.getDebtor(
        keccak256(this.abiCoder.encode(['string'], [nik])),
      );

      return debtor;
    } catch (error: any) {
      if (!error.data) {
        this.logger.error('Error data is undefined:', error);
        throw error;
      }

      try {
        const decodedError = this.contract.interface.parseError(error.data);
        this.logger.error(decodedError);
        throw decodedError;
      } catch (parseError) {
        this.logger.error('Error parsing failed:', parseError);
        throw error;
      }
    }
  }
}
