import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { StatusProviderDelegationDTO } from './dto/status-delegation.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { ReqCreditorDelegationDTO } from './dto/req-delegation.dto';
import { DelegationApprovalDTO } from './dto/delegation-approval.dto';
import { ReqDelegationResponseDTO } from './dto/response/req-delegation-res.dto';
import { WrapperResponseDTO } from 'src/common/helper/response';
import { DelegationApprovalResponseDTO } from './dto/response/delegation-approval-res.dto';
import { StatusDelegationResponseDTO } from './dto/response/status-delegation-res.dto';
import { RegistrationCreditorResponseDTO } from './dto/response/registration-res.dto';
import { CreditorService } from './creditor.service';

@Controller('/api/creditor')
export class CreditorController {
  constructor(
    private readonly creditorService: CreditorService,
    private readonly logger: Logger,
  ) {}

  @ApiExtraModels(WrapperResponseDTO, ReqDelegationResponseDTO)
  @ApiOperation({
    summary: 'Request Delegation',
    description: 'Request delegation to creditor for accessing data.',
  })
  @ApiCreatedResponse({
    description: 'Creditor approval request successfully sent.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponseDTO) },
        {
          properties: {
            data: { $ref: getSchemaPath(ReqDelegationResponseDTO) },
            message: {
              type: 'string',
              example: 'Delegation request to creditor sent.',
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
  @Post('/creditor-delegation')
  async reqCreditorApproval(
    @Body() dto: ReqCreditorDelegationDTO,
  ): Promise<WrapperResponseDTO<ReqDelegationResponseDTO>> {
    const { nik, creditor_wallet_address } = dto;
    await this.creditorService.createDelegation(nik, creditor_wallet_address);

    const response: ReqDelegationResponseDTO = {
      transaction_hash: '0xbatu...',
      status: 'PENDING',
    };
    this.logger.log('Request success.');
    return new WrapperResponseDTO(
      response,
      'Delegation request to creditor sent.',
    );
  }

  @ApiExtraModels(WrapperResponseDTO, StatusDelegationResponseDTO)
  @ApiOperation({
    summary: 'Get Status Request Delegation',
    description: 'Retrieve lastest status of delegation to creditor.',
  })
  @ApiOkResponse({
    description: 'Get status of creditor delegation successfully.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponseDTO) },
        {
          properties: {
            data: { $ref: getSchemaPath(StatusDelegationResponseDTO) },
            message: {
              type: 'string',
            },
          },
        },
      ],
    },
    examples: {
      approved: {
        summary: 'Delegation approved.',
        value: {
          data: {
            status: 'APPROVED',
          },
          message: 'Delegation approved.',
        },
      },
      rejected: {
        summary: 'Delegation rejected.',
        value: {
          data: {
            status: 'REJECTED',
          },
          message: 'Delegation rejected.',
        },
      },
      pending: {
        summary: 'Delegation pending.',
        value: {
          data: {
            status: 'PENDING',
          },
          message: 'Delegation pending.',
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
  @Get('/creditor-delegation/status')
  @ApiQuery({
    name: 'nik',
    required: true,
    description: 'National Identification number.',
    example: '123...',
  })
  @ApiQuery({
    name: 'creditor_wallet_address',
    required: true,
    description: 'Unique wallet address of creditor.',
    example: '0x...',
  })
  async statusCreditorDelegation(
    @Query() dto: StatusProviderDelegationDTO,
  ): Promise<WrapperResponseDTO<StatusProviderDelegationDTO>> {
    const { nik, creditor_wallet_address } = dto;
    await this.creditorService.getStatusCreditorDelegation(
      nik,
      creditor_wallet_address,
    );

    const response: StatusProviderDelegationDTO = {
      nik: '2123...',
      creditor_wallet_address: '0x...',
    };
    this.logger.log('Request success.');
    return new WrapperResponseDTO(response, 'waduh success');
  }

  @ApiExtraModels(WrapperResponseDTO, DelegationApprovalResponseDTO)
  @ApiOperation({
    summary: 'Give approval or rejection of delegation request',
    description:
      'Give approval for access for other creditor to access debtor active data from source creditor.',
  })
  @ApiOkResponse({
    description: 'Get status of provider delegation successfully.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponseDTO) },
        {
          properties: {
            data: { $ref: getSchemaPath(DelegationApprovalResponseDTO) },
            message: {
              type: 'string',
            },
          },
        },
      ],
    },
    examples: {
      approved: {
        summary: 'Delegation approved.',
        value: {
          data: {
            status: 'APPROVED',
            transaction_hash: '0x123abc...',
          },
          message: 'Delegation has been accepted.',
        },
      },
      rejected: {
        summary: 'Delegation rejected.',
        value: {
          data: {
            status: 'REJECTED',
            transaction_hash: '0x123abc...',
          },
          message: 'Delegation has been rejected.',
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
  async delegationApproval(
    @Body() dto: DelegationApprovalDTO,
  ): Promise<WrapperResponseDTO<DelegationApprovalResponseDTO>> {
    const { nik, is_approve, creditor_walet_address } = dto;

    await this.creditorService.delegationApproval(
      nik,
      is_approve,
      creditor_walet_address,
    );

    const response: DelegationApprovalResponseDTO = {
      status: 'APPROVED',
      transaction_hash: '0x123...',
      message: 'Delegation has been accepted.',
    };
    this.logger.log('Request success.');
    return new WrapperResponseDTO(response, 'waduh success');
  }

  @ApiExtraModels(WrapperResponseDTO, RegistrationCreditorResponseDTO)
  @ApiOperation({
    summary: 'Registration Creditor',
    description: 'Registration for creating wallet addresses for creditors.',
  })
  @ApiOkResponse({
    description: 'Registration creditors success.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponseDTO) },
        {
          properties: {
            data: { $ref: getSchemaPath(RegistrationCreditorResponseDTO) },
            message: {
              type: 'string',
              example: 'Creditor registration success.',
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
  async registration(): Promise<WrapperResponseDTO<void>> {
    await this.creditorService.registration();
    this.logger.log('Request success.');
    return new WrapperResponseDTO(null, 'Creditor registration success.');
  }
}
