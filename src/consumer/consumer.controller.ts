import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ReqCustomerApprovalDTO } from './dto/req-customer-approval.dto';
import { StatusCustomerApprovalDTO } from './dto/status-customer-approval.dto';
import { ReqProviderDelegationDTO } from './dto/req-provider-delegation.dto';
import { StatusProviderDelegationDTO } from './dto/status-provider-delegation.dto';

@Controller('/api/consumer')
export class ConsumerController {
  @Post('/req-customer-approval')
  async reqCustomerApproval(@Body() dto: ReqCustomerApprovalDTO): void {}

  @Get('/status-customer-approval')
  async statusCustomerApproval(@Query() dto: StatusCustomerApprovalDTO): void {}

  @Post('/req-provider-delegation')
  async reqProviderDelegation(@Body() dto: ReqProviderDelegationDTO): void {}

  @Get('/status-provider-delegation')
  async statusProviderDelegation(
    @Query() dto: StatusProviderDelegationDTO,
  ): void {}
}
