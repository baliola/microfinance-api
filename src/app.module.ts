import { Module } from '@nestjs/common';
import { CreditorModule } from './model/creditor/creditor.module';
import { DebtorModule } from './model/debtor/debtor.module';

@Module({
  imports: [CreditorModule, DebtorModule],
})
export class AppModule {}
