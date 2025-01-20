import { Body, Controller, Post } from '@nestjs/common';
import { DelegationApprovalDTO } from './dto/delegation-approval.dto';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('/api/provider')
export class ProviderController {
  @ApiOperation({
    summary: 'Delegation for Consumer',
    description: 'Delegation for give consumer accessing the data.',
  })
  @ApiOkResponse({
    description: 'Delegation of provider success.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['APPROVED', 'REJECTED'],
                },
                transaction_hash: {
                  type: 'string',
                  nullable: true,
                },
              },
            },
            message: {
              type: 'string',
            },
          },
        },
        examples: {
          approved: {
            summary: 'Delegation approved.',
            value: {
              data: {
                status: 'APPROVED',
                transaction_hash: '0x...',
              },
              message: 'Delegation has been accepted.',
            },
          },
          rejected: {
            summary: 'Delegation rejected',
            value: {
              data: {
                status: 'REJECTED',
                transaction_hash: null,
              },
              message: 'Delegation has been rejected.',
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation Error.',
    schema: {
      example: {
        data: null,
        messsage: 'Validation Error.',
      },
    },
  })
  @Post('/delegation-approval')
  async delegationApproval(@Body() dto: DelegationApprovalDTO): Promise<void> {
    console.log('dto: ', dto);
  }
}
