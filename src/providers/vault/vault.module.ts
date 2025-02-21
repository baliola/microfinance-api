import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VaultService } from './vault';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [VaultService, Logger, ConfigService],
  exports: [VaultService],
})
export class VaultModule {}
