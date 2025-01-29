import { Logger, Module } from '@nestjs/common';
import { DebtorController } from './debtor.controller';
import { DebtorService } from './debtor.service';

@Module({
  controllers: [DebtorController],
  providers: [DebtorService, Logger],
})
export class DebtorModule {}
