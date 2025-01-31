import { Module } from '@nestjs/common';
import { CreditorModule } from './model/creditor/creditor.module';
import { DebtorModule } from './model/debtor/debtor.module';
import { ConfigModule } from '@nestjs/config';
import { validatedConfig } from './config.schema';
import { EthersModule } from './providers/ethers/ethers.module';

@Module({
  imports: [
    CreditorModule,
    DebtorModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}` || '.env',
      load: [() => validatedConfig],
    }),
    EthersModule,
  ],
})
export class AppModule {}
