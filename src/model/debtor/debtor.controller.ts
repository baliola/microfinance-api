import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LogActivityDTO } from './dto/log-activity.dto';
import { RegistrationDebtorDTO } from './dto/registration.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import { LogActivityResponseDTO } from './dto/response/log-activity-response.dto';
import { WrapperResponseDTO } from 'src/common/helper/response';
import { RegistrationDebtorResponseDTO } from './dto/response/registration-res.dto';

@Controller('/api/debtor')
export class DebtorController {
  @ApiExtraModels(WrapperResponseDTO, LogActivityResponseDTO)
  @ApiOperation({
    summary: 'Log of activity from Debtor Data',
    description: 'Retrieve log of data activity.',
  })
  @ApiOkResponse({
    description: 'Get log data success.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponseDTO) },
        {
          properties: {
            data: { $ref: getSchemaPath(LogActivityResponseDTO) },
            message: {
              type: 'string',
              example: 'Log activity retrieved.',
            },
          },
        },
      ],
    },
    examples: {
      approved: {
        summary: 'Approved log.',
        value: {
          data: {
            creditor: 'Koperasi A',
            status: 'APPROVED',
            accessed_at: 'YYYY-MM-DD',
          },
        },
      },
      rejected: {
        summary: 'Rejected log.',
        value: {
          data: {
            creditor: 'Koperasi A',
            status: 'REJECTED',
            accessed_at: 'YYYY-MM-DD',
          },
        },
      },
      pending: {
        summary: 'Pending log.',
        value: {
          data: {
            creditor: 'Koperasi A',
            status: 'PENDING',
            accessed_at: 'YYYY-MM-DD',
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
  @Get('/log-activity')
  async approvalConsumer(
    @Query() dto: LogActivityDTO,
  ): Promise<LogActivityResponseDTO[]> {
    console.log(dto);
    return [{ creditor: '0x', status: 'PENDING', accessed_at: new Date() }];
  }

  @ApiExtraModels(WrapperResponseDTO, RegistrationDebtorResponseDTO)
  @ApiOperation({
    summary: 'Registration Debtor Data',
    description: 'Registration for retrieve wallet address.',
  })
  @ApiCreatedResponse({
    description: 'Registration for creating wallet addresses for debtor.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponseDTO) },
        {
          properties: {
            data: { $ref: getSchemaPath(RegistrationDebtorResponseDTO) },
            message: {
              type: 'string',
              example: 'Registration success.',
            },
          },
        },
      ],
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
  async registration(
    @Body() dto: RegistrationDebtorDTO,
  ): Promise<RegistrationDebtorResponseDTO> {
    console.log('dto: ', dto);
    return { wallet_address: '0x...' };
  }
}
