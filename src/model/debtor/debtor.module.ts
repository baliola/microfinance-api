import { Logger, Module } from '@nestjs/common';
import { DebtorController } from './debtor.controller';
import { DebtorService } from './debtor.service';
import { EthersService } from '../../providers/ethers/ethers';
import { VaultService } from '../../providers/vault/vault';

@Module({
  controllers: [DebtorController],
  providers: [DebtorService, EthersService, VaultService, Logger],
  exports: [DebtorService],
})
export class DebtorModule {}
