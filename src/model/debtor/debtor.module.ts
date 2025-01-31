import { Logger, Module } from '@nestjs/common';
import { DebtorController } from './debtor.controller';
import { DebtorService } from './debtor.service';
import { EthersService } from 'src/providers/ethers/ethers';

@Module({
  controllers: [DebtorController],
  providers: [DebtorService, EthersService, Logger],
})
export class DebtorModule {}
