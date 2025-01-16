import { Body, Controller, Post } from '@nestjs/common';
import { ApprovalConsumerDTO } from './dto/approval-consumer.dto';
import { RegistrationCustomerDTO } from './dto/registration.dto';

@Controller('/api/customer')
export class CustomerController {
  @Post('/approval-consumer')
  async approvalConsumer(@Body() dto: ApprovalConsumerDTO): void {}

  @Post('/registration')
  async registration(@Body() dto: RegistrationCustomerDTO): void {}
}
