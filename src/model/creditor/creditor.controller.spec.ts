import { Test, TestingModule } from '@nestjs/testing';
import { CreditorController } from './creditor.controller';
import { CreditorService } from './creditor.service';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RegistrationCreditorDTO } from './dto/registration.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GetCreditorDTO } from './dto/get-creditor.dto';
import { RemoveCreditorDTO } from './dto/remove-creditor.dto';
import { PurchasePackageDTO } from './dto/purchase-package.dto';
import { AddDebtorToCreditorDTO } from './dto/add-debtor-to-creditor.dto';
import { WrapperResponseDTO } from '../../common/helper/response';
import { ReqCreditorDelegationDTO } from './dto/req-delegation.dto';
import { DelegationApprovalDTO } from './dto/delegation-approval.dto';
import { StatusCreditorDelegationDTO } from './dto/status-delegation.dto';
import { GetActiveCreditorByStatusDTO } from './dto/get-active-creditor-by-status.dto';

jest.mock('ethers', () => {
  const actualEthers = jest.requireActual('ethers');
  // const { getAddress } = actualEthers;

  const mockSigner = {
    getAddress: jest.fn().mockResolvedValue('0xmockedSignerAddress'),
    signTypedData: jest.fn((domain, types, message) => {
      return Promise.resolve(`0x${message.from.slice(2)}Signed`);
    }),
  };

  const mockWallet = {
    address: '0x0000000000000000000000000000000000000001',
    privateKey: '0xmockedPrivateKey',
    signMessage: jest.fn().mockResolvedValue('0xsignedMockMessage'),
    signTypedData: jest.fn().mockResolvedValue('0xmockedSignature'),
    getAddress: jest
      .fn()
      .mockResolvedValue('0x0000000000000000000000000000000000000001'),
  };

  const mockProvider = {
    getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
    getSigner: jest.fn().mockReturnValue(mockSigner),
    getBlockNumber: jest.fn().mockResolvedValue(123456),
    signTypedData: jest.fn().mockResolvedValue('0xmockedSignature'),
  };

  const mockTx = {
    hash: '0x123456789',
    wait: jest.fn().mockResolvedValue({ status: 1 }), // ✅ Mock wait()
  };

  const mockContract = {
    address: '0x0000000000000000000000000000000000000001',
    callStatic: {
      someFunction: jest.fn().mockResolvedValue('mockedReturnValue'),
    },
    someFunction: jest.fn().mockResolvedValue('mockedTransaction'),
    interface: {
      encodeFunctionData: jest.fn(() => '0xMockedEncodedData'), // Add this line
    },
    nonces: jest.fn().mockResolvedValue(1),
    executeMetaTransaction: jest.fn().mockResolvedValue(mockTx),
  };

  return {
    ...actualEthers,
    Wallet: jest.fn().mockImplementation(() => mockWallet),
    providers: {
      JsonRpcProvider: jest.fn().mockImplementation(() => mockProvider),
    },
    Contract: jest.fn().mockImplementation(() => mockContract),
    verifyTypedData: jest
      .fn()
      .mockReturnValue('0x0000000000000000000000000000000000000001'),
  };
});

const mockCommonResponse = {
  wallet_address: '0x123456abcdef',
  tx_hash: '0x123456abcdef123456abcdef',
  onchain_url: 'https://example.com/tx/0x123456abcdef123456abcdef',
};

const mockStatusResponse = 'APPROVED';

const mockApprovalResponse = {
  status: 'APPROVED',
  tx_hash: '0x123456abcdef123456abcdef',
  onchain_url: 'https://example.com/tx/0x123456abcdef123456abcdef',
};

const mockGetResponse = {
  wallet_address: '0x123456abcdef',
};

const mockActiveCreditorResponse = ['0x123456', '0xabcdef'];

describe('CreditorController', () => {
  let controller: CreditorController;

  const mockCreditorService = {
    registration: jest.fn(),
    delegationApproval: jest.fn(),
    createDelegation: jest.fn(),
    getCreditor: jest.fn(),
    removeCreditor: jest.fn(),
    purchasePackage: jest.fn(),
    addDebtorToCreditor: jest.fn(),
    getStatusCreditorDelegation: jest.fn(),
    getActiveCreditorByStatus: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      const configValue = {
        CRYPTO_SECRET: 'batu',
        ONCHAIN_URL: 'http://127.0.0.1:8545/tx/',
        VAULT_API_VERSION: 'v1',
        VAULT_ADDR: 'http://127.0.0.1:8200/',
        VAULT_ROOT_TOKEN: 'mock-vault-root-token',
        RPC_URL: 'http://127.0.0.1:8545/',
        PRIVATE_KEY: '0xmockedPrivateKey',
        CONTRACT_ADDRESS: '0xmockedContractAddress',
      };

      return configValue[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreditorController],
      providers: [
        {
          provide: CreditorService,
          useValue: mockCreditorService,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<CreditorController>(CreditorController);

    // mocking services
    mockCreditorService.registration.mockResolvedValue(mockCommonResponse);
    mockCreditorService.getCreditor.mockResolvedValue(mockGetResponse);
    mockCreditorService.removeCreditor.mockResolvedValue(mockCommonResponse);
    mockCreditorService.purchasePackage.mockResolvedValue(mockCommonResponse);
    mockCreditorService.addDebtorToCreditor.mockResolvedValue(
      mockCommonResponse,
    );
    mockCreditorService.createDelegation.mockResolvedValue(mockCommonResponse);
    mockCreditorService.delegationApproval.mockResolvedValue(
      mockApprovalResponse,
    );
    mockCreditorService.getStatusCreditorDelegation.mockResolvedValue(
      mockStatusResponse,
    );
    mockCreditorService.getActiveCreditorByStatus.mockResolvedValue(
      mockActiveCreditorResponse,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Registration', () => {
    const validDto: RegistrationCreditorDTO = {
      creditor_code: '12345',
      institution_code: '123',
      institution_name: 'Koperasi A',
      approval_date: '2025-02-22',
      signer_name: 'Bapak A',
      signer_position: 'CEO',
    };

    const invalidDto: any = {
      creditor_code: 1,
      institution_code: 1,
      institution_name: 1,
      approval_date: 1,
      signer_name: 1,
      signer_position: 1,
    };

    it('should allow request for registration', async () => {
      const data = await controller.registration(validDto);
      expect(data).toBeDefined();
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('message');
      expect(data.data).toHaveProperty('wallet_address');
      expect(data.data).toHaveProperty('tx_hash');
      expect(data.data).toHaveProperty('onchain_url');
    });

    it('should reject request for registration if payload invalid', async () => {
      const transforemedDTO = plainToInstance(
        RegistrationCreditorDTO,
        invalidDto,
      );
      const error = await validate(transforemedDTO);
      expect(error.length).toBeGreaterThan(0);
      expect(error.map((e) => Object.values(e.constraints || {}))).toEqual(
        expect.arrayContaining([
          expect.arrayContaining(['creditor_code must be a string']),
          expect.arrayContaining(['institution_code must be a string']),
          expect.arrayContaining(['institution_name must be a string']),
          expect.arrayContaining([
            'approval_date must be a valid ISO 8601 date string',
          ]),
          expect.arrayContaining(['signer_name must be a string']),
          expect.arrayContaining(['signer_position must be a string']),
        ]),
      );
    });
  });

  describe('Get Creditor', () => {
    const validDTO: GetCreditorDTO = {
      creditor_code: '12345',
    };

    const invalidDTO: any = {
      creditor_code: 12345,
    };

    it('should allow request for get creditor data', async () => {
      const data = await controller.getCreditor(validDTO);
      expect(data).toBeDefined();
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('message');
      expect(data.data).toHaveProperty('wallet_address');
    });

    it('should reject request for get creditor data if payload invalid', async () => {
      const transforemedDTO = plainToInstance(GetCreditorDTO, invalidDTO);
      const error = await validate(transforemedDTO);
      expect(error.length).toBeGreaterThan(0);
      expect(error.map((e) => Object.values(e.constraints || {}))).toEqual(
        expect.arrayContaining([
          expect.arrayContaining(['creditor_code must be a string']),
        ]),
      );
    });
  });

  describe('Remove Creditor', () => {
    const validDTO: RemoveCreditorDTO = {
      creditor_code: '12345',
    };

    const invalidDTO: any = {
      creditor_code: 12345,
    };

    it('should allow request for removing creditor', async () => {
      const data = await controller.removeCreditor(validDTO);
      expect(data).toBeDefined();
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('message');
      expect(data.data).toHaveProperty('tx_hash');
      expect(data.data).toHaveProperty('onchain_url');
    });

    it('should reject request for removing creditor if payload invalid', async () => {
      const transforemedDTO = plainToInstance(RemoveCreditorDTO, invalidDTO);
      const error = await validate(transforemedDTO);
      expect(error.length).toBeGreaterThan(0);
      expect(error.map((e) => Object.values(e.constraints || {}))).toEqual(
        expect.arrayContaining([
          expect.arrayContaining(['creditor_code must be a string']),
        ]),
      );
    });
  });

  describe('Purchase Package', () => {
    const validDTO: PurchasePackageDTO = {
      creditor_address: '0x123456abcdef',
      institution_code: '012345',
      invoice_number: '1',
      purchase_date: '2022-02-02',
      package_id: 1,
      quantity: 1,
      start_date: '2022-02-02',
      end_date: '2022-03-02',
      quota: 1,
    };

    const invalidDTO: any = {
      creditor_address: false,
      institution_code: false,
      invoice_number: false,
      purchase_date: false,
      package_id: false,
      quantity: false,
      start_date: false,
      end_date: false,
      quota: false,
    };

    it('should allow request for purchase package', async () => {
      const data = await controller.purchasePackage(validDTO);

      expect(data).toBeDefined();
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('message');
      expect(data.data).toHaveProperty('tx_hash');
      expect(data.data).toHaveProperty('onchain_url');
    });

    it('should reject request for purchase package if payload invalid', async () => {
      const transforemedDTO = plainToInstance(RemoveCreditorDTO, invalidDTO);
      const error = await validate(transforemedDTO);
      expect(error.length).toBeGreaterThan(0);
      expect(error.map((e) => Object.values(e.constraints || {}))).toEqual(
        expect.arrayContaining([
          expect.arrayContaining(['creditor_code must be a string']),
        ]),
      );
    });
  });

  describe('Add Debtor to Creditor', () => {
    const validDto: AddDebtorToCreditorDTO = {
      debtor_nik: '5101010',
      debtor_name: 'Panji Petualang',
      creditor_code: '12345',
      creditor_name: 'Koperasi A',
      application_date: '2022-02-02',
      approval_date: '2022-02-21',
      url_approval: 'https://example.com',
      url_KTP: 'https://example.com',
    };

    const invalidDTO: any = {
      debtor_nik: 1,
      debtor_name: 1,
      creditor_code: 1,
      creditor_name: 1,
      application_date: 1,
      approval_date: 1,
      url_approval: 1,
      url_KTP: 1,
    };

    it('should allow request to Add Debtor to Creditor', async () => {
      const data = await controller.addDebtorToCreditor(validDto);

      expect(data).toBeDefined();
      expect(data).toBeInstanceOf(WrapperResponseDTO);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('message');
      expect(data.data).toHaveProperty('debtor_nik');
      expect(data.data).toHaveProperty('creditor_code');
      expect(data.data).toHaveProperty('name');
      expect(data.data).toHaveProperty('creditor_name');
      expect(data.data).toHaveProperty('application_date');
      expect(data.data).toHaveProperty('approval_date');
      expect(data.data).toHaveProperty('url_KTP');
      expect(data.data).toHaveProperty('url_approval');
      expect(data.data).toHaveProperty('tx_hash');
      expect(data.data).toHaveProperty('onchain_url');
    });

    it('should reject request to Add Debtor to Creditor if payload invalid', async () => {
      const transforemedDTO = plainToInstance(RemoveCreditorDTO, invalidDTO);
      const error = await validate(transforemedDTO);
      expect(error.length).toBeGreaterThan(0);
      expect(error.map((e) => Object.values(e.constraints || {}))).toEqual(
        expect.arrayContaining([
          expect.arrayContaining(['creditor_code must be a string']),
        ]),
      );
    });
  });

  describe('Create Delegation', () => {
    const validDTO: ReqCreditorDelegationDTO = {
      debtor_nik: '5101010',
      creditor_consumer_code: '54321',
      creditor_provider_code: '12345',
      request_id: '1',
      transaction_id: '1',
      reference_id: '1',
      request_date: '2025-02-02',
    };
    const invalidDTO: any = {
      debtor_nik: 1,
      creditor_consumer_code: 1,
      creditor_provider_code: 1,
      request_id: 1,
      transaction_id: 1,
      reference_id: 1,
      request_date: 1,
    };

    it('should allow request for create delegation', async () => {
      const data = await controller.reqCreditorDelegation(validDTO);

      expect(data).toBeDefined();
      expect(data).toBeInstanceOf(WrapperResponseDTO);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('message');
      expect(data.data).toHaveProperty('nik');
      expect(data.data).toHaveProperty('creditor_consumer_code');
      expect(data.data).toHaveProperty('creditor_provider_code');
      expect(data.data).toHaveProperty('request_id');
      expect(data.data).toHaveProperty('transaction_id');
      expect(data.data).toHaveProperty('reference_id');
      expect(data.data).toHaveProperty('request_date');
      expect(data.data).toHaveProperty('tx_hash');
      expect(data.data).toHaveProperty('onchain_url');
    });

    it('should reject request for create delegation if payload invalid', async () => {
      const transforemedDTO = plainToInstance(
        ReqCreditorDelegationDTO,
        invalidDTO,
      );
      const error = await validate(transforemedDTO);
      expect(error.length).toBeGreaterThan(0);
      expect(error.map((e) => Object.values(e.constraints || {}))).toEqual(
        expect.arrayContaining([
          expect.arrayContaining(['debtor_nik must be a string']),
          expect.arrayContaining(['creditor_consumer_code must be a string']),
          expect.arrayContaining(['creditor_provider_code must be a string']),
          expect.arrayContaining(['request_id must be a string']),
          expect.arrayContaining(['transaction_id must be a string']),
          expect.arrayContaining(['reference_id must be a string']),
          expect.arrayContaining([
            'request_date must be a valid ISO 8601 date string',
          ]),
        ]),
      );
    });
  });

  describe('Delegation Approval', () => {
    const validDto: DelegationApprovalDTO = {
      debtor_nik: '5101010',
      is_approve: true,
      creditor_consumer_code: '54321',
      creditor_provider_code: '12345',
    };

    const invalidDto: any = {
      debtor_nik: 1,
      is_approve: 1,
      creditor_consumer_code: 1,
      creditor_provider_code: 1,
    };

    it('should allow request for approval delegation', async () => {
      const data = await controller.delegationApproval(validDto);

      expect(data).toBeDefined();
      expect(data).toBeInstanceOf(WrapperResponseDTO);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('message');
      expect(data.data).toHaveProperty('status');
      expect(data.data).toHaveProperty('tx_hash');
      expect(data.data).toHaveProperty('onchain_url');
    });

    it('should reject request for approval delegation if payload invalid', async () => {
      const transforemedDTO = plainToInstance(
        DelegationApprovalDTO,
        invalidDto,
      );
      const error = await validate(transforemedDTO);
      expect(error.length).toBeGreaterThan(0);
      expect(error.map((e) => Object.values(e.constraints || {}))).toEqual(
        expect.arrayContaining([
          expect.arrayContaining(['debtor_nik must be a string']),
          expect.arrayContaining(['creditor_consumer_code must be a string']),
          expect.arrayContaining(['creditor_provider_code must be a string']),
          expect.arrayContaining(['is_approve must be a boolean value']),
        ]),
      );
    });
  });

  describe('Creditor Delegation Status', () => {
    const validDto: StatusCreditorDelegationDTO = {
      creditor_code: '54321',
      nik: '5101010',
    };
    const invalidDto: any = {
      creditor_code: 1,
      nik: 1,
    };

    it('should allow request for get Status Delegation', async () => {
      const data = await controller.statusCreditorDelegation(validDto);
      expect(data).toBeDefined();
      expect(data).toBeInstanceOf(WrapperResponseDTO);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('message');
      expect(data.data).toHaveProperty('status');
    });

    it('should reject request for get Status Delegation if payload invalid', async () => {
      const transforemedDTO = plainToInstance(
        StatusCreditorDelegationDTO,
        invalidDto,
      );
      const error = await validate(transforemedDTO);
      expect(error.length).toBeGreaterThan(0);
      expect(error.map((e) => Object.values(e.constraints || {}))).toEqual(
        expect.arrayContaining([
          expect.arrayContaining(['nik must be a string']),
          expect.arrayContaining(['creditor_code must be a string']),
        ]),
      );
    });
  });

  describe('Get Active Creditor By Status', () => {
    const validDto: GetActiveCreditorByStatusDTO = {
      debtor_nik: '5101010',
      status: 'APPROVED',
    };
    const invalidDto: any = {
      debtor_nik: 5101010,
      status: null,
    };

    it('should allow request for get Active Creditor by Status', async () => {
      const data = await controller.getActiveCreditorByStatus(validDto);
      expect(data).toBeDefined();
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('message');
      expect(data.data).toHaveProperty('creditors');
    });
    it('should allow reject for get Active Creditor by Status if payload invalid', async () => {
      const transforemedDTO = plainToInstance(
        GetActiveCreditorByStatusDTO,
        invalidDto,
      );
      const error = await validate(transforemedDTO);
      expect(error.length).toBeGreaterThan(0);
      expect(error.map((e) => Object.values(e.constraints || {}))).toEqual(
        expect.arrayContaining([
          expect.arrayContaining(['debtor_nik must be a string']),
          expect.arrayContaining([
            'status must be one of: PENDING, APPROVED, REJECTED',
          ]),
        ]),
      );
    });
  });
});
