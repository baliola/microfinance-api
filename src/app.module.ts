import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConsumerController } from './consumer/consumer.controller';
import { ConsumerService } from './consumer/consumer.service';
import { CustomerController } from './customer/customer.controller';
import { CustomerService } from './customer/customer.service';
import { ProviderController } from './provider/provider.controller';
import { ProviderService } from './provider/provider.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    ConsumerController,
    CustomerController,
    ProviderController,
  ],
  providers: [AppService, ConsumerService, CustomerService, ProviderService],
})
export class AppModule {}
