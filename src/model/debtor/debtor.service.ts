import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { IDebtorService } from './util/debtor.service.interface';
import { EthersService } from '../../providers/ethers/ethers';
import {
  RegistrationServiceType,
  RemoveDebtorType,
} from './util/debtor-type.service';
import { LogActivityType } from './util/debtor-type.service';
import { VaultService } from '../../providers/vault/vault';
import { TypeKey, WalletAddressType } from '../../utils/type/type';
import { encrypt } from '../../utils/crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DebtorService implements IDebtorService {
  constructor(
    private readonly ethersService: EthersService,
    private readonly logger: Logger,
    private readonly vaultService: VaultService,
    private readonly configService: ConfigService,
  ) {}
  async getLogActivity(nik: string): Promise<LogActivityType> {
    try {
      const log = await this.ethersService.getLogData(nik);
      if (!log || log[0].length === 0 || log[1].length === 0) {
        return { wallet_address: null, status: null };
      }

      const statusMap: Record<
        number,
        'NONE' | 'REJECTED' | 'APPROVED' | 'PENDING'
      > = {
        0: 'NONE',
        1: 'REJECTED',
        2: 'APPROVED',
        3: 'PENDING',
      };

      const data = {
        wallet_address: log[0] || null,
        status: Array.isArray(log[1])
          ? log[1].map((value: number) => statusMap[value])
          : [],
      };

      return data;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async registration(nik: string): Promise<RegistrationServiceType> {
    try {
      const { address, privateKey } = this.ethersService.generateHDNodeWallet();
      const wallet =
        this.ethersService.generateWalletWithPrivateKey(privateKey);
      const tx = await this.ethersService.addDebtor(nik, wallet);

      const secret = this.configService.get<string>('CRYPTO_SECRET');
      const encryptedData = encrypt(privateKey, secret);

      await this.vaultService.storePrivateKey(
        encryptedData,
        address as WalletAddressType,
        TypeKey.DEBTOR,
      );

      const onchain_url = `${this.configService.get<string>('ONCHAIN_URL')}${tx.hash}`;

      return { wallet_address: address, tx_hash: tx.hash, onchain_url };
    } catch (error: any) {
      this.logger.error(error);
      console.log('error: ', error);
      if (
        error.code === 'CALL_EXCEPTION' &&
        error.shortMessage.includes('execution reverted (unknown custom error)')
      ) {
        throw new BadRequestException('Debtor already exist.');
      }
      throw error;
    }
  }

  async removeDebtor(nik: string): Promise<RemoveDebtorType> {
    try {
      const tx = await this.ethersService.removeDebtor(nik);

      const onchain_url = `${this.configService.get<string>('ONCHAIN_URL')}${tx.hash}`;

      return { tx_hash: tx.hash, onchain_url };
    } catch (error: any) {
      this.logger.error(error);
      if (error.code) {
        throw new BadRequestException('Debtor already removed.');
      }
      throw error;
    }
  }

  async getDebtor(nik: string): Promise<WalletAddressType | null> {
    try {
      const tx = await this.ethersService.getDebtor(nik);
      if (tx === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      return tx;
    } catch (error) {
      throw error;
    }
  }
}
