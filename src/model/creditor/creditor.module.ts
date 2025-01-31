import { Logger, Module } from '@nestjs/common';
import { CreditorController } from './creditor.controller';
import { CreditorService } from './creditor.service';
import { EthersService } from 'src/providers/ethers/ethers';

@Module({
  controllers: [CreditorController],
  providers: [CreditorService, Logger, EthersService],
})
export class CreditorModule {}
