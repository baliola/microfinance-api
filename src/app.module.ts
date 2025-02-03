import { Module } from '@nestjs/common';
import { CreditorModule } from './model/creditor/creditor.module';
import { DebtorModule } from './model/debtor/debtor.module';
import { ConfigModule } from '@nestjs/config';
import { validatedConfig } from './config.schema';
import { EthersModule } from './providers/ethers/ethers.module';
import { VaultModule } from './providers/vault/vault.module';
import { existsSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Function to load JSON configuration from vault-config.json
const loadVaultConfig = () => {
  const filePath = join(__dirname, '..', 'vault-config.json');
  if (existsSync(filePath)) {
    const jsonConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return jsonConfig;
  }
  return {};
};

@Module({
  imports: [
    CreditorModule,
    DebtorModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => {
          dotenv.config({ path: '.env' });
          const vaultConfig = loadVaultConfig();
          return { ...validatedConfig, ...vaultConfig };
        },
      ],
      expandVariables: true,
    }),
    EthersModule,
    VaultModule,
  ],
})
export class AppModule {}
