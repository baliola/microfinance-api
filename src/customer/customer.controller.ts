import { Body, Controller, Post } from '@nestjs/common';
import { ApprovalConsumerDTO } from './dto/approval-consumer.dto';
import { RegistrationCustomerDTO } from './dto/registration.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('/api/customer')
export class CustomerController {
  @ApiOperation({
    summary: 'Accepting/Rejecting Approval',
    description: 'Accept or reject approval from consumer for accessing data.',
  })
  @ApiOkResponse({
    description: 'Approval of customer success.',
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
            summary: 'Approval accepted',
            value: {
              data: {
                status: 'APPROVED',
                transaction_hash: '0x...',
              },
              message: 'Approval has been accepted.',
            },
          },
          rejected: {
            summary: 'Approval rejected',
            value: {
              data: {
                status: 'REJECTED',
                transaction_hash: null,
              },
              message: 'Approval has been rejected.',
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
  @Post('/approval-consumer')
  async approvalConsumer(@Body() dto: ApprovalConsumerDTO): Promise<void> {
    console.log('dto: ', dto);
  }

  @ApiOperation({
    summary: 'Registration Customer Data',
    description: 'Registration for retrieve wallet address.',
  })
  @ApiCreatedResponse({
    description: 'Registration for creating wallet addresses for customer.',
    schema: {
      example: {
        data: {
          wallet_address: '0x...',
        },
        message: 'Registration success.',
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
  @Post('/registration')
  async registration(@Body() dto: RegistrationCustomerDTO): Promise<void> {
    console.log('dto: ', dto);
  }
}
