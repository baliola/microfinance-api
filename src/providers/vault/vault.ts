import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Client } from '@litehex/node-vault';
import { ConfigService } from '@nestjs/config';
import { TypeKey, VaultPrefix, WalletAddressType } from '../../utils/type/type';

@Injectable()
export class VaultService implements OnModuleInit, OnModuleDestroy {
  private vaultClient: Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  onModuleInit() {
    const apiVersion = this.configService.get<string>('VAULT_API_VERSION');
    const endpoint = this.configService.get<string>('VAULT_ADDR');
    const token = this.configService.get<string>('VAULT_ROOT_TOKEN');

    this.vaultClient = new Client({
      apiVersion,
      endpoint,
      token,
    });
  }

  onModuleDestroy() {
    this.vaultClient = null;
  }

  private async createOrUpdate(mountPath: string, path: string, data: object) {
    try {
      this.logger.log(
        `Creating/Updating secret at mountPath: ${mountPath}, path: ${path}, data: ${JSON.stringify(
          data,
        )}`,
      );

      await this.vaultClient.kv2.write({
        path: path,
        mountPath: mountPath,
        data: data,
      });
      this.logger.log(`Secret created/updated at path: ${mountPath}/${path}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to create/update secret at path ${mountPath}/${path}: ${error.message}`,
      );
      throw error;
    }
  }

  private async read(mountPath: string, path: string) {
    try {
      this.logger.debug(
        `Reading secret at mountPath: ${mountPath}, path: ${path}`,
      );
      const result = await this.vaultClient.kv2.read({ mountPath, path });
      if (!result?.data?.data.data) {
        this.logger.warn(`No data found in secret at path: ${path}`);
        return {};
      }

      return result.data.data.data;
    } catch (error: any) {
      this.logger.error(
        `Failed to read secret at path ${path}: ${error.message}`,
      );
      throw error;
    }
  }

  // public method
  async storePrivateKey(
    private_key: string,
    address: WalletAddressType,
    type: TypeKey,
  ) {
    try {
      const vaultPath = `${VaultPrefix.PK_PATH}/${type}/${address}`;
      const isExist = await this.read(VaultPrefix.VAULT, vaultPath);
      if (isExist && isExist?.data === private_key) {
        throw new BadRequestException(
          'Private key already exists for this address.',
        );
      }

      const vaultData = {
        private_key,
        address,
        type,
        created_at: new Date().toISOString(),
      };
      await this.createOrUpdate(VaultPrefix.VAULT, vaultPath, vaultData);
      this.logger.log(
        `Private key for address ${address} has been successfully stored.`,
      );
    } catch (error: any) {
      this.logger.error(
        `Error storing private key for address ${address}: ${error.message}`,
      );
      throw error;
    }
  }

  async readPrivateKey(address: string, type: TypeKey) {
    try {
      const vaultPath = `${VaultPrefix.PK_PATH}/${type}/${address}`;
      const data = await this.read(VaultPrefix.VAULT, vaultPath);
      if (data && data.private_key) {
        const private_key = data.private_key;
        this.logger.log(`Private key retrieved for address ${address}`);
        return private_key;
      } else {
        throw new BadRequestException(
          `Private key not found for address ${address}`,
        );
      }
    } catch (error: any) {
      this.logger.error(
        `Error reading private key for address ${address}: ${error.message}`,
      );
      throw error;
    }
  }
}
