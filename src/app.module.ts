import { Module } from '@nestjs/common';
import { ConsumerModule } from './module/consumer/consumer.module';
import { CustomerModule } from './module/customer/customer.module';
import { ProviderModule } from './module/provider/provider.module';

@Module({
  imports: [ConsumerModule, CustomerModule, ProviderModule],
})
export class AppModule {}
