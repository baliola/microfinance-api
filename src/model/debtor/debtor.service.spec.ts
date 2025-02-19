import { Test, TestingModule } from '@nestjs/testing';
import { DebtorService } from './debtor.service';
import { EthersService } from '../../providers/ethers/ethers';
import { BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VaultService } from '../../providers/vault/vault';
import { regexPattern } from '../../utils/type/regex.type';

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

describe('DebtorService', () => {
  let service: DebtorService;

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
      providers: [
        DebtorService,
        EthersService,
        VaultService,
        { provide: Logger, useValue: mockLogger },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<DebtorService>(DebtorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Registration', () => {
    const nik: string = '5101010';
    it('should accept registration for debtor', async () => {
      jest.spyOn(service as any, 'registration').mockResolvedValue({
        wallet_address: '0x1234567890',
        tx_hash: '0xabcdef234567890',
        onchain_url: 'http://127.0.0.1:8545/tx/0xabcdef234567890',
      });

      const data = await service.registration(nik);
      expect(data).toBeDefined();
      expect(data).toHaveProperty('wallet_address');
      expect(data).toHaveProperty('tx_hash');
      expect(data).toHaveProperty('onchain_url');
    });

    it('should throw BadRequestException if debtor already exists', async () => {
      const mockError = new BadRequestException({
        code: 'CALL_EXCEPTION',
        message: 'Debtor already exist.',
      });
      // Simulate an error in the method, such as debtor already existing
      jest.spyOn(service as any, 'registration').mockRejectedValue(mockError);
      try {
        await service.registration(nik);
      } catch (error: any) {
        // Expect the error to be a BadRequestException
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Debtor already exist.');
      }
    });

    it('should throw an error if another unexpected error occurs', async () => {
      // Simulate an unexpected error
      jest
        .spyOn(service as any, 'registration')
        .mockRejectedValue(new Error('Unexpected error'));

      try {
        await service.registration(nik);
      } catch (error: any) {
        // Expect the error to be an instance of Error
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Unexpected error');
      }
    });
  });

  describe('Remove Debtor', () => {
    const nik: string = '5101010';
    it('should allow to removing debtor data', async () => {
      jest.spyOn(service as any, 'removeDebtor').mockResolvedValue({
        tx_hash: '0xabcdef234567890',
        onchain_url: 'http://127.0.0.1:8545/tx/0xabcdef234567890',
      });

      const data = await service.removeDebtor(nik);
      expect(data).toBeDefined();
      expect(data).toHaveProperty('tx_hash');
      expect(data).toHaveProperty('onchain_url');
    });

    it('should throw BadRequestException if debtor already exists', async () => {
      const mockError = new BadRequestException({
        code: 'CALL_EXCEPTION',
        message: 'Debtor already removed.',
      });
      // Simulate an error in the method, such as debtor already existing
      jest.spyOn(service as any, 'removeDebtor').mockRejectedValue(mockError);
      try {
        await service.removeDebtor(nik);
      } catch (error: any) {
        // Expect the error to be a BadRequestException
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Debtor already removed.');
      }
    });

    it('should throw an error if another unexpected error occurs', async () => {
      // Simulate an unexpected error
      jest
        .spyOn(service as any, 'removeDebtor')
        .mockRejectedValue(new Error('Unexpected error'));

      try {
        await service.removeDebtor(nik);
      } catch (error: any) {
        // Expect the error to be an instance of Error
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Unexpected error');
      }
    });
  });

  describe('Get Debtor', () => {
    const nik: string = '5101010';
    it('should allow to get debtor data', async () => {
      jest
        .spyOn(service as any, 'getDebtor')
        .mockResolvedValue('0x14B01e9753c6a337bD8B26F645302969B48d37ab');

      const data = await service.getDebtor(nik);
      expect(data).toBeDefined();
      expect(data).toMatch(regexPattern.walletPattern);
    });

    it('should return null if debtor does not exist', async () => {
      // Mock ethersService.getDebtor to return the address indicating the debtor does not exist
      jest
        .spyOn(service['ethersService'], 'getDebtor')
        .mockResolvedValue('0x0000000000000000000000000000000000000000');

      // Call the method
      const result = await service.getDebtor(nik);

      // Check that the result is null
      expect(result).toBeNull();
    });
  });

  describe('Get Log Activity', () => {
    const nik: string = '5101010';

    it('should accept to get log activity', async () => {
      jest
        .spyOn(service['ethersService'], 'getLogData')
        .mockResolvedValue([
          '0x1234567890abcdef1234567890abcdef12345678',
          [0, 2, 3],
        ]);

      const result = await service.getLogActivity(nik);

      expect(result).toEqual({
        wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
        status: ['NONE', 'APPROVED', 'PENDING'],
      });
    });

    it('should return { wallet_address: null, status: null } if log data is an empty array', async () => {
      jest
        .spyOn(service['ethersService'], 'getLogData')
        .mockResolvedValue([[], []]);

      const result = await service.getLogActivity(nik);

      expect(result).toEqual({ wallet_address: null, status: null });
    });

    it('should return { wallet_address: null, status: null } if log data is null', async () => {
      jest
        .spyOn(service['ethersService'], 'getLogData')
        .mockResolvedValue(null);

      const result = await service.getLogActivity(nik);

      expect(result).toEqual({ wallet_address: null, status: null });
    });
  });
});
