import { Test, TestingModule } from '@nestjs/testing';
import { DebtorController } from './debtor.controller';
import { DebtorService } from './debtor.service';
import { Logger } from '@nestjs/common';
import { LogActivityDTO } from './dto/log-activity.dto';
import { WrapperResponseDTO } from '../../common/helper/response';
import { RegistrationDebtorDTO } from './dto/registration.dto';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GetDebtorDTO } from './dto/get-debtor.dto';
import { RemoveDebtorDTO } from './dto/remove-debtor.dto';

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

const mockLogActivity = {
  wallet_address: ['0x123456abcdef', '0x123456abcdef'],
  status: ['APPROVED', 'PENDING'],
};

const mockRegistration = {
  wallet_address: '0x123456abcdef',
  tx_hash: '0xabcdef1234',
  onchain_url: 'https://example.com/tx/0xabcdef1234',
};

const mockRemoveDebtor = {
  tx_hash: '0xabcdef1234',
  onchain_url: 'https://example.com/tx/0xabcdef1234',
};

const mockGetDebtor = '0xabcdef1234';

describe('DebtorController', () => {
  let controller: DebtorController;

  const mockDebtorService = {
    getLogActivity: jest.fn(),
    registration: jest.fn(),
    removeDebtor: jest.fn(),
    getDebtor: jest.fn(),
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
      controllers: [DebtorController],
      providers: [
        { provide: DebtorService, useValue: mockDebtorService },
        { provide: Logger, useValue: mockLogger },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<DebtorController>(DebtorController);

    // mocking services
    mockDebtorService.registration.mockResolvedValue(mockRegistration);
    mockDebtorService.getDebtor.mockResolvedValue(mockGetDebtor);
    mockDebtorService.removeDebtor.mockResolvedValue(mockRemoveDebtor);
    mockDebtorService.getLogActivity.mockResolvedValue(mockLogActivity);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Registration', () => {
    const validDto: RegistrationDebtorDTO = {
      debtor_nik: '5101010',
    };
    const invalidDto: any = {
      debtor_nik: 5101010,
    };

    it('should allow request for registration debtor', async () => {
      const data = await controller.registration(validDto);

      expect(data).toBeInstanceOf(WrapperResponseDTO);
      expect(data).toBeDefined();
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('message');
      expect(data.data).toHaveProperty('wallet_address');
      expect(data.data).toHaveProperty('tx_hash');
      expect(data.data).toHaveProperty('onchain_url');
    });

    it('should reject request for registration debtor if payload invalid', async () => {
      const transforemedDTO = plainToInstance(
        RegistrationDebtorDTO,
        invalidDto,
      );
      const error = await validate(transforemedDTO);
      expect(error.length).toBeGreaterThan(0);
      expect(error.map((e) => Object.values(e.constraints || {}))).toEqual(
        expect.arrayContaining([
          expect.arrayContaining(['debtor_nik must be a string']),
        ]),
      );
    });
  });

  describe('Get Debtor', () => {
    const validDto: GetDebtorDTO = {
      debtor_nik: '5101010',
    };
    const invalidDto: any = {
      debtor_nik: 5101010,
    };

    it('should allow request for get debtor', async () => {
      const data = await controller.getDebtor(validDto);

      expect(data).toBeInstanceOf(WrapperResponseDTO);
      expect(data).toBeDefined();
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('message');
      expect(data.data).toHaveProperty('wallet_address');
    });

    it('should reject request for get debtor if payload invalid', async () => {
      const transforemedDTO = plainToInstance(GetDebtorDTO, invalidDto);
      const error = await validate(transforemedDTO);
      expect(error.length).toBeGreaterThan(0);
      expect(error.map((e) => Object.values(e.constraints || {}))).toEqual(
        expect.arrayContaining([
          expect.arrayContaining(['debtor_nik must be a string']),
        ]),
      );
    });
  });

  describe('Remove Debtor', () => {
    const validDto: RemoveDebtorDTO = {
      debtor_nik: '5101010',
    };
    const invalidDto: any = {
      debor_nik: 5101010,
    };

    it('should allow request for remove debtor', async () => {
      const data = await controller.removeDebtor(validDto);

      expect(data).toBeInstanceOf(WrapperResponseDTO);
      expect(data).toBeDefined();
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('message');
      expect(data.data).toHaveProperty('tx_hash');
      expect(data.data).toHaveProperty('onchain_url');
    });

    it('should reject request for remove debtor if payload invalid', async () => {
      const transforemedDTO = plainToInstance(GetDebtorDTO, invalidDto);
      const error = await validate(transforemedDTO);
      expect(error.length).toBeGreaterThan(0);
      expect(error.map((e) => Object.values(e.constraints || {}))).toEqual(
        expect.arrayContaining([
          expect.arrayContaining(['debtor_nik must be a string']),
        ]),
      );
    });
  });

  describe('Log Activity', () => {
    const validDto: LogActivityDTO = {
      debtor_nik: '12345',
    };
    const invalidDto: any = {
      debtor_nik: 12345,
    };

    it('should request debtor log activity and return response', async () => {
      const data = await controller.logActivity(validDto);

      expect(data).toBeInstanceOf(WrapperResponseDTO);
      expect(data).toBeDefined();
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('message');
      expect(data.data).toHaveProperty('accessed_at');
      expect(data.data).toHaveProperty('creditors');
      expect(data.data).toHaveProperty('status');
    });
    it('should reject debtor log activity and return response if payload invalid', async () => {
      const transforemedDTO = plainToInstance(LogActivityDTO, invalidDto);
      const error = await validate(transforemedDTO);
      expect(error.length).toBeGreaterThanOrEqual(0);
      expect(error.map((e) => Object.values(e.constraints || {}))).toEqual(
        expect.arrayContaining([
          expect.arrayContaining(['debtor_nik must be a string']),
        ]),
      );
    });
  });
});
