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
import { StatusCreditorDelegationDTO } from './dto/status-delegation.dto';
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
import { DelegationApprovalResponseDTO } from './dto/response/delegation-approval-res.dto';
import { StatusDelegationResponseDTO } from './dto/response/status-delegation-res.dto';
import { RegistrationCreditorResponseDTO } from './dto/response/registration-res.dto';
import { CreditorService } from './creditor.service';
import { WrapperResponseDTO } from '../../common/helper/response';
import { RegistrationCreditorDTO } from './dto/registration.dto';
import { AddDebtorToCreditorDTO } from './dto/add-debtor-to-creditor.dto';
import { AddDebtorToCreditorResponseDTO } from './dto/response/add-debtor-to-creditor-res.dto';
import { RemoveCreditorDTO } from './dto/remove-creditor.dto';
import { RemoveCreditorResponseDTO } from './dto/response/remove-creditor-res.dto';
import { PurchasePackageDTO } from './dto/purchase-package.dto';
import { PurchasePackageResponseDTO } from './dto/response/purchase-package-res.dto';
import { GetCreditorDTO } from './dto/get-creditor.dto';
import { GetCreditorResponseDTO } from './dto/response/get-creditor-res.dto';
import { WalletAddressType } from 'src/utils/type/type';
import { GetActiveCreditorByStatusDTO } from './dto/get-active-creditor-by-status.dto';
import { GetActiveCreditorByStatusResponseDTO } from './dto/response/get-active-creditor-by-status-res.dto';

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
  @ApiOkResponse({
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
  @Post('creditor-delegation')
  @HttpCode(HttpStatus.OK)
  async reqCreditorDelegation(
    @Body() dto: ReqCreditorDelegationDTO,
  ): Promise<WrapperResponseDTO<ReqDelegationResponseDTO>> {
    try {
      const { tx_hash, onchain_url } =
        await this.creditorService.createDelegation(
          dto.debtor_nik,
          dto.creditor_consumer_code,
          dto.creditor_provider_code,
          dto.request_id,
          dto.transaction_id,
          dto.reference_id,
          dto.request_date,
        );

      const response: ReqDelegationResponseDTO = {
        nik: dto.debtor_nik,
        creditor_consumer_code: dto.creditor_consumer_code as WalletAddressType,
        creditor_provider_code: dto.creditor_provider_code as WalletAddressType,
        request_id: dto.request_id,
        transaction_id: dto.transaction_id,
        reference_id: dto.reference_id,
        request_date: dto.request_date,
        tx_hash: tx_hash as `0x${string}`,
        onchain_url,
      };

      return new WrapperResponseDTO(
        response,
        'Delegation request to creditor sent.',
      );
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
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
            timestamp: {
              type: 'string',
              example: 'YYYY-MM-DDT00:00:00.000Z',
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
  @Get('creditor-delegation/status')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: 'nik',
    required: true,
    description: 'National Identification number.',
    example: '123...',
  })
  @ApiQuery({
    name: 'creditor_code',
    required: true,
    description: 'Unique code of creditor.',
    example: '...',
  })
  async statusCreditorDelegation(
    @Query() dto: StatusCreditorDelegationDTO,
  ): Promise<WrapperResponseDTO<StatusDelegationResponseDTO>> {
    try {
      const { nik, creditor_code } = dto;
      const status = await this.creditorService.getStatusCreditorDelegation(
        nik,
        creditor_code,
      );

      let message: string;
      switch (status) {
        case 'APPROVED':
          message = 'Delegation approved.';
          break;
        case 'PENDING':
          message = 'Delegation pending.';
          break;
        case 'REJECTED':
          message = 'Delegation rejected.';
          break;
        case 'NONE':
          message = 'Delegation has none status.';
          break;
      }
      const response: StatusDelegationResponseDTO = {
        status,
      };
      this.logger.log('Request success.');
      return new WrapperResponseDTO(response, message);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
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
            timestamp: {
              type: 'string',
              example: 'YYYY-MM-DDT00:00:00.000Z',
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
            tx_hash: '0x123abc...',
            onchain_url: '...',
          },
          message: 'Delegation has been accepted.',
        },
      },
      rejected: {
        summary: 'Delegation rejected.',
        value: {
          data: {
            status: 'REJECTED',
            tx_hash: '0x123abc...',
            onchain_url: '...',
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
  @Post('delegation-approval')
  @HttpCode(HttpStatus.OK)
  async delegationApproval(
    @Body() dto: DelegationApprovalDTO,
  ): Promise<WrapperResponseDTO<DelegationApprovalResponseDTO>> {
    try {
      const {
        provider_address,
        debtor_nik,
        is_approve,
        creditor_consumer_code,
        creditor_provider_code,
      } = dto;

      const { tx_hash, status, onchain_url } =
        await this.creditorService.delegationApproval(
          provider_address,
          debtor_nik,
          is_approve,
          creditor_consumer_code,
          creditor_provider_code,
        );

      const response: DelegationApprovalResponseDTO = {
        status,
        tx_hash,
        onchain_url,
      };
      this.logger.log('Request success.');
      return new WrapperResponseDTO(response, 'Delegation has been accepted.');
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @ApiExtraModels(WrapperResponseDTO, RegistrationCreditorResponseDTO)
  @ApiOperation({
    summary: 'Registration Creditor',
    description: 'Registration for creating wallet addresses for creditors.',
  })
  @ApiCreatedResponse({
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
    @Body() dto: RegistrationCreditorDTO,
  ): Promise<WrapperResponseDTO<RegistrationCreditorResponseDTO>> {
    try {
      const {
        creditor_code,
        institution_code,
        institution_name,
        approval_date,
        signer_name,
        signer_position,
      } = dto;
      const { wallet_address, tx_hash, onchain_url } =
        await this.creditorService.registration(
          creditor_code,
          institution_code,
          institution_name,
          approval_date,
          signer_name,
          signer_position,
        );

      const response: RegistrationCreditorResponseDTO = {
        wallet_address: wallet_address as `0x${string}`,
        tx_hash: tx_hash as `0x${string}`,
        onchain_url,
      };
      return new WrapperResponseDTO(response, 'Creditor registration success.');
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @ApiExtraModels(WrapperResponseDTO, AddDebtorToCreditorResponseDTO)
  @ApiOperation({
    summary: 'Add Debtor to Creditor',
    description: 'Add active debtor to creditor.',
  })
  @ApiOkResponse({
    description: 'Adding debtor to creditor success.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponseDTO) },
        {
          properties: {
            data: { $ref: getSchemaPath(AddDebtorToCreditorResponseDTO) },
            message: {
              type: 'string',
              example: 'Adding debtor to creditor success.',
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
  @Post('add-debtor-to-creditor')
  @HttpCode(HttpStatus.OK)
  async addDebtorToCreditor(
    @Body() dto: AddDebtorToCreditorDTO,
  ): Promise<WrapperResponseDTO<AddDebtorToCreditorResponseDTO>> {
    try {
      const { tx_hash, onchain_url } =
        await this.creditorService.addDebtorToCreditor(
          dto.debtor_nik,
          dto.creditor_code,
          dto.debtor_name,
          dto.creditor_name,
          dto.application_date,
          dto.approval_date,
          dto.url_KTP,
          dto.url_approval,
        );

      const response: AddDebtorToCreditorResponseDTO = {
        debtor_nik: dto.debtor_nik,
        creditor_code: dto.creditor_code,
        name: dto.debtor_name,
        creditor_name: dto.creditor_name,
        application_date: dto.application_date,
        approval_date: dto.approval_date,
        url_KTP: dto.url_KTP,
        url_approval: dto.url_approval,
        tx_hash: tx_hash as `0x${string}`,
        onchain_url,
      };

      return new WrapperResponseDTO(
        response,
        'Success add Debtor into Creditor.',
      );
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @ApiExtraModels(WrapperResponseDTO, RemoveCreditorResponseDTO)
  @ApiOperation({
    summary: 'Remove Creditor',
    description: 'Removing creditor from blockchain.',
  })
  @ApiOkResponse({
    description: 'Removing creditor success.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponseDTO) },
        {
          properties: {
            data: { $ref: getSchemaPath(RemoveCreditorResponseDTO) },
            message: {
              type: 'string',
              example: 'Removing Creditor success.',
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
  @Post('remove-creditor')
  @HttpCode(HttpStatus.OK)
  async removeCreditor(
    @Body() dto: RemoveCreditorDTO,
  ): Promise<WrapperResponseDTO<RemoveCreditorResponseDTO>> {
    try {
      const { creditor_code } = dto;

      const { tx_hash, onchain_url } =
        await this.creditorService.removeCreditor(creditor_code);

      const data: RemoveCreditorResponseDTO = {
        tx_hash: tx_hash as `0x${string}`,
        onchain_url,
      };
      return new WrapperResponseDTO(data, 'Removing Creditor success.');
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @ApiExtraModels(WrapperResponseDTO, PurchasePackageResponseDTO)
  @ApiOperation({
    summary: 'Purchase Package',
    description: 'Purchase Quota Package.',
  })
  @ApiOkResponse({
    description: 'Purchasing Package success.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponseDTO) },
        {
          properties: {
            data: { $ref: getSchemaPath(PurchasePackageResponseDTO) },
            message: {
              type: 'string',
              example: 'Purchasing Package success.',
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
  @Post('purchase-package')
  @HttpCode(HttpStatus.OK)
  async purchasePackage(
    @Body() dto: PurchasePackageDTO,
  ): Promise<WrapperResponseDTO<PurchasePackageResponseDTO>> {
    try {
      const {
        creditor_address,
        institution_code,
        purchase_date,
        invoice_number,
        package_id,
        quantity,
        start_date,
        end_date,
        quota,
      } = dto;

      const { tx_hash } = await this.creditorService.purchasePackage(
        creditor_address,
        institution_code,
        purchase_date,
        invoice_number,
        package_id,
        quantity,
        start_date,
        end_date,
        quota,
      );

      const response: PurchasePackageResponseDTO = {
        tx_hash: tx_hash as `0x${string}`,
        onchain_url: tx_hash,
      };

      return new WrapperResponseDTO(response, 'Purchasing Package success.');
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @ApiExtraModels(WrapperResponseDTO, GetCreditorResponseDTO)
  @ApiOperation({
    summary: 'Get Creditor',
    description: 'Get Creditor Data.',
  })
  @ApiOkResponse({
    description: 'Get Creditor success.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponseDTO) },
        {
          properties: {
            data: { $ref: getSchemaPath(GetCreditorResponseDTO) },
            message: {
              type: 'string',
              example: 'Get Creditor success.',
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
  @Post('get-creditor')
  @HttpCode(HttpStatus.OK)
  async getCreditor(
    @Body() dto: GetCreditorDTO,
  ): Promise<WrapperResponseDTO<GetCreditorResponseDTO>> {
    try {
      const { creditor_code } = dto;

      const wallet_address =
        await this.creditorService.getCreditor(creditor_code);

      const response: GetCreditorResponseDTO = {
        wallet_address,
      };

      return new WrapperResponseDTO(response, 'Get Creditor Data Success');
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @ApiExtraModels(WrapperResponseDTO, GetCreditorResponseDTO)
  @ApiOperation({
    summary: 'Get Active Creditor by Status',
    description: 'Get Active Creditor Data based on status.',
  })
  @ApiOkResponse({
    description: 'Get Active Creditor success.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponseDTO) },
        {
          properties: {
            data: { $ref: getSchemaPath(GetCreditorResponseDTO) },
            message: {
              type: 'string',
              example: 'Get Active Creditor success.',
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
  @Get('active-creditor-by-status')
  async getActiveCreditorByStatus(
    @Query() dto: GetActiveCreditorByStatusDTO,
  ): Promise<WrapperResponseDTO<GetActiveCreditorByStatusResponseDTO>> {
    try {
      const { debtor_nik, status } = dto;
      const data = await this.creditorService.getActiveCreditorByStatus(
        debtor_nik,
        status,
      );

      const response: GetActiveCreditorByStatusResponseDTO = {
        creditors: data as WalletAddressType[],
      };

      return new WrapperResponseDTO(response, 'success');
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
