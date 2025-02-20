import { Logger, Module } from '@nestjs/common';
import { CreditorController } from './creditor.controller';
import { CreditorService } from './creditor.service';
import { EthersService } from '../../providers/ethers/ethers';
import { VaultService } from '../../providers/vault/vault';

@Module({
  controllers: [CreditorController],
  providers: [CreditorService, Logger, EthersService, VaultService],
  exports: [CreditorService],
})
export class CreditorModule {}
