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
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import { DelegationApprovalDTO } from './dto/delegation-approval.dto';
import { DelegationApprovalResponseDTO } from './dto/response/delegation-approval-res.dto';
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
import { GetActiveCreditorsDTO } from './dto/get-active-creditor-by-status.dto';
import { GetActiveCreditorsResponseDTO } from './dto/response/get-active-creditor-by-status-res.dto';
import { ProcessActionDTO } from './dto/process-action.dto';
import { ProcessActionResponseDTO } from './dto/response/process-action-res.dto';

@Controller('/api/creditor')
export class CreditorController {
  constructor(
    private readonly creditorService: CreditorService,
    private readonly logger: Logger,
  ) {}

  @ApiExtraModels(WrapperResponseDTO, DelegationApprovalResponseDTO)
  @ApiOperation({
    summary: 'Give approval or rejection of delegation request',
    description: `Give approval for access for other creditor to access debtor active data from source creditor. This Endpoint require **Add Debtor To Creditor** first.`,
    // 'Give approval for access for other creditor to access debtor active data from source creditor.',
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
    description: 'Bad Request Error.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: { type: 'null', example: null },
            message: {
              oneOf: [
                { type: 'string', example: 'Debtor already exists.' },
                {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['debtor_nik must be a string'],
                },
              ],
            },
            timestamp: {
              type: 'string',
              example: '2024-02-20T03:22:52.300Z',
            },
          },
        },
        examples: {
          DuplicateApprovalError: {
            summary: 'Duplicate Approval Error',
            value: {
              data: null,
              message:
                'Providers are unable to approve the request due to an estimate gas issue or the application status is not pending or NIK not registered.',
              timestamp: '2024-02-20T03:22:52.300Z',
            },
          },
          ValidationError: {
            summary: 'Validation Error',
            value: {
              data: null,
              message: [
                'debtor_nik must be a string',
                'is_approve must be a boolean value',
                'creditor_consumer_code must be a string',
                'creditor_provider_code must be a string',
              ],
              timestamp: '2024-02-20T03:22:52.300Z',
            },
          },
        },
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
        debtor_nik,
        creditor_consumer_code,
        creditor_provider_code,
        request_id,
        transaction_id,
        reference_id,
        request_date,
      } = dto;

      const { tx_hash, status, onchain_url } =
        await this.creditorService.delegationApproval(
          debtor_nik,
          creditor_consumer_code,
          creditor_provider_code,
          request_id,
          transaction_id,
          reference_id,
          request_date,
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
    description: 'Bad Request Error.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: { type: 'null', example: null },
            message: {
              oneOf: [
                { type: 'string', example: 'Debtor already exists.' },
                {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['debtor_nik must be a string'],
                },
              ],
            },
            timestamp: {
              type: 'string',
              example: '2024-02-20T03:22:52.300Z',
            },
          },
        },
        examples: {
          ValidationError: {
            summary: 'Validation Error',
            value: {
              data: null,
              message: [
                'creditor_code must be a string',
                'institution_code must be a string',
                'institution_name must be a string',
                'approval_date must be a valid ISO 8601 date string',
                'signer_name must be a string',
                'signer_position must be a string',
              ],
              timestamp: '2024-02-20T03:22:52.300Z',
            },
          },
          CreditorAlreadyExist: {
            summary: 'Creditor Already Exists Error',
            value: {
              data: null,
              message: 'Creditor already exists.',
              timestamp: '2024-02-20T03:22:52.300Z',
            },
          },
        },
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
    description: 'Bad Request Error.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: { type: 'null', example: null },
            message: {
              oneOf: [
                { type: 'string', example: 'Debtor already exists.' },
                {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['debtor_nik must be a string'],
                },
              ],
            },
            timestamp: {
              type: 'string',
              example: '2024-02-20T03:22:52.300Z',
            },
          },
        },
        examples: {
          ValidationError: {
            summary: 'Validation Error',
            value: {
              data: null,
              message: [
                'debtor_nik must be a string',
                'debtor_name must be a string',
                'creditor_code must be a string',
                'creditor_name must be a string',
                'application_date must be a valid ISO 8601 date string',
                'approval_date must be a valid ISO 8601 date string',
                'url_KTP must be a URL address',
                'url_approval must be a URL address',
              ],
              timestamp: '2024-02-20T03:22:52.300Z',
            },
          },
          DebtorAlreadyAddError: {
            summary: 'Debtor Already Add Error',
            value: {
              data: null,
              message: 'Debtor already add to Creditor.',
              timestamp: '2024-02-20T03:22:52.300Z',
            },
          },
        },
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
    description: 'Bad Request Error.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: { type: 'null', example: null },
            message: {
              oneOf: [
                { type: 'string', example: 'Creditor already exists.' },
                {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['creditor_code must be a string'],
                },
              ],
            },
            timestamp: {
              type: 'string',
              example: '2024-02-20T03:22:52.300Z',
            },
          },
        },
        examples: {
          ValidationError: {
            summary: 'Validation Error',
            value: {
              data: null,
              message: ['creditor_code must be a string'],
              timestamp: '2024-02-20T03:22:52.300Z',
            },
          },
          DebtorRemoveError: {
            summary: 'Creditor Already Remove Error',
            value: {
              data: null,
              message: 'Creditor already removed or not registered yet.',
              timestamp: '2024-02-20T03:22:52.300Z',
            },
          },
        },
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
    description: 'Bad Request Error.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: { type: 'null', example: null },
            message: {
              oneOf: [
                { type: 'string', example: 'Debtor already exists.' },
                {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['debtor_nik must be a string'],
                },
              ],
            },
            timestamp: {
              type: 'string',
              example: '2024-02-20T03:22:52.300Z',
            },
          },
        },
        examples: {
          ValidationError: {
            summary: 'Validation Error',
            value: {
              data: null,
              message: [
                'creditor_address must be a string',
                'institution_code must be a string',
                'purchase_date must be a string',
                'invoice_number must be a string',
                'package_id must be a number conforming to the specified constraints',
                'quantity must be a number conforming to the specified constraints',
                'start_date must be a valid ISO 8601 date string',
                'end_date must be a valid ISO 8601 date string',
                'quota must be a number conforming to the specified constraints',
              ],
              timestamp: '2024-02-20T03:22:52.300Z',
            },
          },
        },
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
    description: 'Get debtor success.',
    content: {
      'application/json': {
        schema: {
          oneOf: [
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
        examples: {
          DebtorExist: {
            summary: 'Creditor Exist',
            value: {
              data: {
                wallet_address: '0x...',
              },
              message: 'Get Creditor Data success.',
              timestamp: '2024-02-20T03:22:52.300Z',
            },
          },
          DebtorNotExist: {
            summary: 'Creditor Not Exist',
            value: {
              data: null,
              message: 'Get Creditor Data success.',
              timestamp: '2024-02-20T03:22:52.300Z',
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Error.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: { type: 'null', example: null },
            message: {
              oneOf: [
                { type: 'string', example: 'Creditor already exists.' },
                {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['creditor_code must be a string'],
                },
              ],
            },
            timestamp: {
              type: 'string',
              example: '2024-02-20T03:22:52.300Z',
            },
          },
        },
        examples: {
          ValidationError: {
            summary: 'Validation Error',
            value: {
              data: null,
              message: ['creditor_code must be a string'],
              timestamp: '2024-02-20T03:22:52.300Z',
            },
          },
        },
      },
    },
  })
  @Get('get-creditor')
  @HttpCode(HttpStatus.OK)
  async getCreditor(
    @Query() dto: GetCreditorDTO,
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
    summary: 'Get Active Creditors',
    description: 'Get Active Creditors.',
  })
  @ApiOkResponse({
    description: 'Get Active Creditors success.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponseDTO) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                creditors: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['0x...', '0x...', '0x...'],
                },
              },
            },
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
    description: 'Bad Request Error.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: { type: 'null', example: null },
            message: {
              oneOf: [
                { type: 'string', example: 'Debtor already exists.' },
                {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['debtor_nik must be a string'],
                },
              ],
            },
            timestamp: {
              type: 'string',
              example: '2024-02-20T03:22:52.300Z',
            },
          },
        },
        examples: {
          NIKNotRegisterError: {
            summary: 'NIK Not Registered Error',
            value: {
              data: null,
              message: 'NIK need to be registered first.',
              timestamp: '2024-02-20T03:22:52.300Z',
            },
          },
        },
      },
    },
  })
  @Get('active-creditor-by-status')
  async getActiveCreditors(
    @Query() dto: GetActiveCreditorsDTO,
  ): Promise<WrapperResponseDTO<GetActiveCreditorsResponseDTO>> {
    try {
      const { debtor_nik } = dto;
      const data =
        await this.creditorService.getActiveCreditorByStatus(debtor_nik);

      const response: GetActiveCreditorsResponseDTO = {
        creditors: data as WalletAddressType[],
      };

      return new WrapperResponseDTO(
        response,
        'Get Active Creditors by Status success.',
      );
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @ApiExtraModels(WrapperResponseDTO, ProcessActionResponseDTO)
  @ApiOperation({
    summary: 'Process Action',
    description: `This function combines the functionality of **'addDebtorToCreditor'** and **'delegate'**.

By calling this function, the system will:
1. Add the provider creditor to the debtor data with APPROVED status.
2. Update the status of the delegation request between the consumer and provider creditors to APPROVED.`,
  })
  @ApiCreatedResponse({
    description: 'Process Action success.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponseDTO) },
        {
          properties: {
            data: { $ref: getSchemaPath(ProcessActionResponseDTO) },
            message: {
              type: 'string',
              example: 'Process Action success.',
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
    description: 'Bad Request Error.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: { type: 'null', example: null },
            message: {
              oneOf: [
                { type: 'string', example: 'Debtor already exists.' },
                {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['debtor_nik must be a string'],
                },
              ],
            },
            timestamp: {
              type: 'string',
              example: '2024-02-20T03:22:52.300Z',
            },
          },
        },
        examples: {
          ValidationError: {
            summary: 'Validation Error',
            value: {
              data: null,
              message: [
                'debtor_nik must be a string',
                'debtor_name must be a string',
                'creditor_consumer_code must be a string',
                'creditor_provider_code must be a string',
                'creditor_provider_name must be a string',
                'application_date must be a valid ISO 8601 date string',
                'approval_date must be a valid ISO 8601 date string',
                'url_KTP must be a URL address',
                'url_approval must be a URL address',
                'request_date must be a valid ISO 8601 date string',
                'request_id must be a string',
                'transaction_id must be a string',
                'reference_id must be a string',
              ],
              timestamp: '2024-02-20T03:22:52.300Z',
            },
          },
        },
      },
    },
  })
  /**
   * API Name possibly to change
   */
  @Post('process-action')
  async processAction(
    @Body() dto: ProcessActionDTO,
  ): Promise<WrapperResponseDTO<ProcessActionResponseDTO>> {
    try {
      const {
        debtor_name,
        debtor_nik,
        creditor_consumer_code,
        creditor_provider_code,
        creditor_provider_name,
        application_date,
        approval_date,
        url_KTP,
        url_approval,
        reference_id,
        request_date,
        request_id,
        transaction_id,
      } = dto;

      const data = await this.creditorService.processAction(
        debtor_nik,
        debtor_name,
        creditor_consumer_code,
        creditor_provider_code,
        creditor_provider_name,
        application_date,
        approval_date,
        url_KTP,
        url_approval,
        request_id,
        transaction_id,
        reference_id,
        request_date,
      );

      const response: ProcessActionResponseDTO = {
        tx_hash: data.hash as WalletAddressType,
        onchain_url: data.onchain_url,
      };
      return new WrapperResponseDTO(response, 'Process Action success.');
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
