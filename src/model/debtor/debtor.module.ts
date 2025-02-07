import { Logger, Module } from '@nestjs/common';
import { DebtorController } from './debtor.controller';
import { DebtorService } from './debtor.service';
import { EthersService } from 'src/providers/ethers/ethers';
import { VaultService } from 'src/providers/vault/vault';

@Module({
  controllers: [DebtorController],
  providers: [DebtorService, EthersService, VaultService, Logger],
  exports: [DebtorService],
})
export class DebtorModule {}
