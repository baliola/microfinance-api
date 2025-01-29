import { Logger, Module } from '@nestjs/common';
import { CreditorController } from './creditor.controller';
import { CreditorService } from './creditor.service';

@Module({
  controllers: [CreditorController],
  providers: [CreditorService, Logger],
})
export class CreditorModule {}
