import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
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
import { WrapperResponseDTO } from '../../common/helper/response';
import { RegistrationDebtorResponseDTO } from './dto/response/registration-res.dto';
import { DebtorService } from './debtor.service';

@Controller('/api/debtor')
export class DebtorController {
  constructor(
    private readonly debtorService: DebtorService,
    private readonly logger: Logger,
  ) {}

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
    example: {
      data: {
        creditor: ['0x123...', '0xabc...', '0xcde...'],
        status: ['APPROVED', 'APPROVED', 'APPROVED'],
        accessed_at: 'YYYY-MM-DD',
      },
      message: 'Log activity retrieved.',
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
  async logActivity(
    @Query() dto: LogActivityDTO,
  ): Promise<WrapperResponseDTO<LogActivityResponseDTO[]>> {
    try {
      const { debtor_nik } = dto;
      const { wallet_address, status } =
        await this.debtorService.getLogActivity(debtor_nik);

      const response: LogActivityResponseDTO[] = [
        { creditor: wallet_address, status, accessed_at: new Date() },
      ];
      return new WrapperResponseDTO(response, 'Log activity retrieved.');
    } catch (error) {
      this.logger.error(error);
    }
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
  ): Promise<WrapperResponseDTO<RegistrationDebtorResponseDTO>> {
    try {
      const { debtor_nik } = dto;
      const { wallet_address, tx_hash } =
        await this.debtorService.registration(debtor_nik);

      const response: RegistrationDebtorResponseDTO = {
        wallet_address: wallet_address as `0x${string}`,
        tx_hash: tx_hash as `0x${string}`,
      };

      return new WrapperResponseDTO(response, 'Registration success.');
    } catch (error) {
      this.logger.error(error);
    }
  }
}
