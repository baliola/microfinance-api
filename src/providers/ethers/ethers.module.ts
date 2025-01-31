import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EthersService } from './ethers';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [EthersService, Logger],
  exports: [EthersService],
})
export class EthersModule {}
