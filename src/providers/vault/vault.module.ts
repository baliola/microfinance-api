import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VaultService } from './vault';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [VaultService, Logger],
  exports: [VaultService],
})
export class VaultModule {}
