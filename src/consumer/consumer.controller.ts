import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ReqCustomerApprovalDTO } from './dto/req-customer-approval.dto';
import { StatusCustomerApprovalDTO } from './dto/status-customer-approval.dto';
import { ReqProviderDelegationDTO } from './dto/req-provider-delegation.dto';
import { StatusProviderDelegationDTO } from './dto/status-provider-delegation.dto';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';

@Controller('/api/consumer')
export class ConsumerController {
  @ApiOperation({
    summary: 'Request Customer Approval',
    description: 'Request approval to customer for accessing data in provider.',
  })
  @ApiOkResponse({
    description: 'Customer approval request successfully sent.',
    schema: {
      example: {
        data: {
          status: 'PENDING',
          transaction_hash: '0x...',
        },
        messsage: 'Approval request to customer sent.',
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
  @Post('/customer-approval')
  async reqCustomerApproval(
    @Body() dto: ReqCustomerApprovalDTO,
  ): Promise<void> {
    console.log('dto: ', dto);
  }

  @ApiOperation({
    summary: 'Get Customer Approval',
    description: 'Retrieve status of approval from customer.',
  })
  @ApiOkResponse({
    description: 'Get status of customer delegation successfully.',
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
                  enum: ['PENDING', 'REJECTED', 'APPROVED'],
                },
              },
            },
            message: {
              type: 'string',
            },
          },
        },
        examples: {
          pending: {
            summary: 'Request pending',
            value: {
              data: {
                status: 'PENDING',
              },
              message: 'Request pending.',
            },
          },
          rejected: {
            summary: 'Request rejected',
            value: {
              data: {
                status: 'REJECTED',
              },
              message: 'Request rejected.',
            },
          },
          approved: {
            summary: 'Request approved',
            value: {
              data: {
                status: 'APPROVED',
              },
              message: 'Request approved.',
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
  @Get('/customer-approval/status')
  @ApiQuery({
    name: 'nik',
    required: true,
    description: 'National Identification number.',
    example: '123...',
  })
  async statusCustomerApproval(
    @Query() dto: StatusCustomerApprovalDTO,
  ): Promise<{ message: string }> {
    console.log('dto: ', dto);
    return { message: 'sukses' };
  }

  @ApiOperation({
    summary: 'Request Provider Delegation',
    description: 'Request delegation to provider for accessing data.',
  })
  @ApiOkResponse({
    description: 'Provider approval request successfully sent.',
    schema: {
      example: {
        data: {
          status: 'PENDING',
          transaction_hash: '0x...',
        },
        messsage: 'Delegation request to provider sent.',
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
  @Post('/provider-delegation')
  async reqProviderDelegation(
    @Body() dto: ReqProviderDelegationDTO,
  ): Promise<void> {
    console.log('dto: ', dto);
  }

  @ApiOperation({
    summary: 'Get Status Request Delegation',
    description: 'Retrieve last status of delegation to provider.',
  })
  @ApiOkResponse({
    description: 'Get status of provider delegation successfully.',
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
                  enum: ['PENDING', 'REJECTED', 'APPROVED'],
                },
              },
            },
            message: {
              type: 'string',
            },
          },
        },
        examples: {
          pending: {
            summary: 'Delegation pending',
            value: {
              data: {
                status: 'PENDING',
              },
              message: 'Delegation pending.',
            },
          },
          rejected: {
            summary: 'Delegation rejected',
            value: {
              data: {
                status: 'REJECTED',
              },
              message: 'Delegation rejected.',
            },
          },
          approved: {
            summary: 'Delegation approved',
            value: {
              data: {
                status: 'APPROVED',
              },
              message: 'Delegation approved.',
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
  @Get('/provider-delegation/status')
  @ApiQuery({
    name: 'nik',
    required: true,
    description: 'National Identification number.',
    example: '123...',
  })
  @ApiQuery({
    name: 'provider_wallet_address',
    required: true,
    description: 'Unique wallet address of provider.',
    example: '0x...',
  })
  async statusProviderDelegation(
    @Query() dto: StatusProviderDelegationDTO,
  ): Promise<void> {
    console.log('dto: ', dto);
  }
}
