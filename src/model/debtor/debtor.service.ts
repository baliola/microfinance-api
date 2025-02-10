import { Injectable, Logger } from '@nestjs/common';
import { IDebtorService } from './util/debtor.service.interface';
import { EthersService } from 'src/providers/ethers/ethers';
import {
  RegistrationServiceType,
  RemoveDebtorType,
} from './util/debtor-type.service';
import { LogActivityType } from './util/debtor-type.service';
import { VaultService } from 'src/providers/vault/vault';
import { TypeKey, WalletAddressType } from 'src/utils/type/type';
import { encrypt } from 'src/utils/crypto';
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
      const statusMap: Record<number, 'REJECTED' | 'APPROVED' | 'PENDING'> = {
        0: 'REJECTED',
        1: 'APPROVED',
        2: 'PENDING',
      };

      const data = {
        wallet_address: log[0],
        status: log[1].map((value) => statusMap[value]),
      };

      return data;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async registration(nik: string): Promise<RegistrationServiceType> {
    try {
      const { address, privateKey } = this.ethersService.generateWallet();
      const tx_hash = await this.ethersService.addDebtor(
        nik,
        address as `0x${string}`,
      );

      const secret = this.configService.get<string>('VAULT_SECRET');
      const { encryptedData } = encrypt(privateKey, secret);

      await this.vaultService.storePrivateKey(
        encryptedData,
        address as WalletAddressType,
        TypeKey.DEBTOR,
      );

      const onchain_url = `${this.configService.get<string>('ONCHAIN_URL')}${tx_hash.hash}`;

      return { wallet_address: address, tx_hash: tx_hash.hash, onchain_url };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async removeDebtor(nik: string): Promise<RemoveDebtorType> {
    try {
      const tx = await this.ethersService.removeDebtor(nik);

      const onchain_url = `${this.configService.get<string>('ONCHAIN_URL')}${tx.hash}`;

      return { tx_hash: tx.hash, onchain_url };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
