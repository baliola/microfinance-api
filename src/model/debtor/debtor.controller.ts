import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Query,
} from '@nestjs/common';
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
import { RemoveDebtorDTO } from './dto/remove-debtor.dto';
import { RemoveDebtorResponseDTO } from './dto/response/remove-debtor-res.dto';
import { GetDebtorDTO } from './dto/get-debtor.dto';
import { GetDebtorResponseDTO } from './dto/response/get-debtor-res.dto';

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
            timestamp: {
              type: 'string',
              example: 'YYYY-MM-DDT00:00:00.000Z',
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
      timestamp: '2025-02-13T12:12:12.012',
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
  @Get('log-activity')
  @HttpCode(HttpStatus.OK)
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
      throw error;
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
              example: 'Debtor registration success.',
            },
            timestamp: {
              type: 'string',
              example: 'YYYY-MM-DDT00:00:00.000Z',
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
  @Post('registration')
  @HttpCode(HttpStatus.CREATED)
  async registration(
    @Body() dto: RegistrationDebtorDTO,
  ): Promise<WrapperResponseDTO<RegistrationDebtorResponseDTO>> {
    try {
      const { debtor_nik } = dto;
      const { wallet_address, tx_hash, onchain_url } =
        await this.debtorService.registration(debtor_nik);

      const response: RegistrationDebtorResponseDTO = {
        wallet_address: wallet_address as `0x${string}`,
        tx_hash: tx_hash as `0x${string}`,
        onchain_url,
      };

      return new WrapperResponseDTO(response, 'Debtor registration success.');
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @ApiExtraModels(WrapperResponseDTO, RemoveDebtorResponseDTO)
  @ApiOperation({
    summary: 'Remove Debtor',
    description: 'Removing debtor from blockchain.',
  })
  @ApiOkResponse({
    description: 'Removing debtor success.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponseDTO) },
        {
          properties: {
            data: { $ref: getSchemaPath(RemoveDebtorResponseDTO) },
            message: {
              type: 'string',
              example: 'Removing Debtor success.',
            },
            timestamp: {
              type: 'string',
              example: 'YYYY-MM-DDT00:00:00.000Z',
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
  @Post('remove-debtor')
  @HttpCode(HttpStatus.OK)
  async removeDebtor(
    @Body() dto: RemoveDebtorDTO,
  ): Promise<WrapperResponseDTO<RemoveDebtorResponseDTO>> {
    try {
      const { debtor_nik } = dto;

      const { tx_hash, onchain_url } =
        await this.debtorService.removeDebtor(debtor_nik);

      const response: RemoveDebtorResponseDTO = {
        tx_hash,
        onchain_url,
      };

      return new WrapperResponseDTO(response, 'Removing Debtor success.');
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @ApiExtraModels(WrapperResponseDTO, GetDebtorResponseDTO)
  @ApiOperation({
    summary: 'Get Debtor',
    description: 'Get Debtor Data.',
  })
  @ApiOkResponse({
    description: 'Get Debtor success.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponseDTO) },
        {
          properties: {
            data: { $ref: getSchemaPath(GetDebtorResponseDTO) },
            message: {
              type: 'string',
              example: 'Get Debtor success.',
            },
            timestamp: {
              type: 'string',
              example: 'YYYY-MM-DDT00:00:00.000Z',
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
  @Post('get-debtor')
  @HttpCode(HttpStatus.OK)
  async getDebtor(
    @Body() dto: GetDebtorDTO,
  ): Promise<WrapperResponseDTO<GetDebtorResponseDTO>> {
    try {
      const { nik } = dto;

      const wallet_address = await this.debtorService.getDebtor(nik);
      const response: GetDebtorResponseDTO = {
        wallet_address,
      };

      return new WrapperResponseDTO(response, 'Get Debtor Data success.');
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
