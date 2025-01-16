import { Body, Controller, Post } from '@nestjs/common';
import { DelegationApprovalDTO } from './dto/delegation-approval.dto';

@Controller('/api/provider')
export class ProviderController {
  @Post('/delegation-approval')
  async delegationApproval(@Body() dto: DelegationApprovalDTO): void {}
}
