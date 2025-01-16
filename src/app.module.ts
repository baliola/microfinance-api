import { Module } from '@nestjs/common';
import { ConsumerModule } from './consumer/consumer.module';
import { CustomerModule } from './customer/customer.module';
import { ProviderModule } from './provider/provider.module';

@Module({
  imports: [ConsumerModule, CustomerModule, ProviderModule],
})
export class AppModule {}
