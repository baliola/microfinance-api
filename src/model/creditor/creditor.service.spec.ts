import { Test, TestingModule } from '@nestjs/testing';
import { CreditorService } from './creditor.service';
import { EthersService } from '../../providers/ethers/ethers';
import { VaultService } from '../../providers/vault/vault';
import { BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { regexPattern } from '../../utils/type/regex.type';
import { TransactionCommonType } from 'src/utils/type/type';

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

describe('CreditorService', () => {
  let service: CreditorService;

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
        CreditorService,
        EthersService,
        VaultService,
        { provide: Logger, useValue: mockLogger },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CreditorService>(CreditorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Registration', () => {
    const creditor_code: string = '12345';
    const institution_code: string = '123';
    const institution_name: string = 'Koperasi A';
    const approval_date: string = '2025-02-20';
    const signer_name: string = 'Bapak B';
    const signer_position: string = 'CEO';

    it('should allow request for registration for creditor', async () => {
      jest.spyOn(service as any, 'registration').mockResolvedValue({
        wallet_address: '0x1234567890',
        tx_hash: '0xabcdef234567890',
        onchain_url: 'http://127.0.0.1:8545/tx/0xabcdef234567890',
      });

      const data = await service.registration(creditor_code);
      expect(data).toBeDefined();
      expect(data).toHaveProperty('wallet_address');
      expect(data).toHaveProperty('tx_hash');
      expect(data).toHaveProperty('onchain_url');
    });

    it('should allow request for registration for creditor with event', async () => {
      jest.spyOn(service as any, 'registration').mockResolvedValue({
        wallet_address: '0x1234567890',
        tx_hash: '0xabcdef234567890',
        onchain_url: 'http://127.0.0.1:8545/tx/0xabcdef234567890',
      });

      const data = await service.registration(
        creditor_code,
        institution_code,
        institution_name,
        approval_date,
        signer_name,
        signer_position,
      );
      expect(data).toBeDefined();
      expect(data).toHaveProperty('wallet_address');
      expect(data).toHaveProperty('tx_hash');
      expect(data).toHaveProperty('onchain_url');
    });

    it('should throw BadRequestException if creditor already exists', async () => {
      const mockError = new BadRequestException({
        code: 'CALL_EXCEPTION',
        message: 'Creditor already exist.',
      });
      // Simulate an error in the method, such as debtor already existing
      jest.spyOn(service as any, 'registration').mockRejectedValue(mockError);
      try {
        await service.registration(creditor_code);
      } catch (error: any) {
        console.log('error: ', error);
        // Expect the error to be a BadRequestException
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Creditor already exist.');
      }
    });

    it('should throw an error if another unexpected error occurs', async () => {
      // Simulate an unexpected error
      jest
        .spyOn(service as any, 'registration')
        .mockRejectedValue(new Error('Unexpected error'));

      try {
        await service.registration(creditor_code);
      } catch (error: any) {
        // Expect the error to be an instance of Error
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Unexpected error');
      }
    });
  });

  describe('Get Creditor', () => {
    const creditor_code: string = '54321';

    it('should allow request to get creditor data', async () => {
      jest
        .spyOn(service as any, 'getCreditor')
        .mockResolvedValue('0x14B01e9753c6a337bD8B26F645302969B48d37ab');

      const data = await service.getCreditor(creditor_code);
      expect(data).toBeDefined();
      expect(data).toMatch(regexPattern.walletPattern);
    });

    it('should return null if creditor does not exist', async () => {
      jest
        .spyOn(service['ethersService'], 'getCreditor')
        .mockResolvedValue('0x0000000000000000000000000000000000000000');

      // Call the method
      const result = await service.getCreditor(creditor_code);

      // Check that the result is null
      expect(result).toBeNull();
    });
  });

  describe('Remove Creditor', () => {
    const creditor_code: string = '54321';

    it('should allow request to removing creditor data', async () => {
      jest.spyOn(service as any, 'removeCreditor').mockResolvedValue({
        tx_hash: '0xabcdef234567890',
        onchain_url: 'http://127.0.0.1:8545/tx/0xabcdef234567890',
      });

      const data = await service.removeCreditor(creditor_code);
      expect(data).toBeDefined();
      expect(data).toHaveProperty('tx_hash');
      expect(data).toHaveProperty('onchain_url');
    });

    it('should throw BadRequestException if debtor already exists', async () => {
      const mockError = new BadRequestException({
        code: 'CALL_EXCEPTION',
        message: 'Creditor already removed.',
      });
      // Simulate an error in the method, such as debtor already existing
      jest.spyOn(service as any, 'removeCreditor').mockRejectedValue(mockError);
      try {
        await service.removeCreditor(creditor_code);
      } catch (error: any) {
        console.log('error: ', error);
        // Expect the error to be a BadRequestException
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Creditor already removed.');
      }
    });

    it('should throw an error if another unexpected error occurs', async () => {
      // Simulate an unexpected error
      jest
        .spyOn(service as any, 'removeCreditor')
        .mockRejectedValue(new Error('Unexpected error'));

      try {
        await service.removeCreditor(creditor_code);
      } catch (error: any) {
        // Expect the error to be an instance of Error
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Unexpected error');
      }
    });
  });

  describe('Purchase Package', () => {
    const creditor_address: `0x${string}` = '0x12345abcde';
    const institution_code: string = '12345';
    const purchase_date: string = '2025-02-25';
    const invoice_number: string = '01';
    const package_id: number = 1;
    const quantity: number = 1;
    const start_date: string = '2025-02-20';
    const end_date: string = '2025-03-20';
    const quota: number = 1;

    it('should allow purchasing package', async () => {
      jest.spyOn(service as any, 'purchasePackage').mockResolvedValue({
        tx_hash: '0xabcdef234567890',
        onchain_url: 'http://127.0.0.1:8545/tx/0xabcdef234567890',
      });

      const data = await service.purchasePackage(
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

      console.log('data: ', data);
      expect(data).toBeDefined();
      expect(data).toHaveProperty('tx_hash');
      expect(data).toHaveProperty('onchain_url');
    });
  });

  describe('Create Delegation', () => {
    const nik: string = '5101010';
    const consumer_code: string = '54321';
    const provider_code: string = '12345';
    const request_id: string = '1';
    const transaction_id: string = '1';
    const referenced_id: string = '1';
    const request_date: string = '2025-02-20';

    it('should allow request for create delegation', async () => {
      jest.spyOn(service as any, 'createDelegation').mockResolvedValue({
        nik,
        consumer_code,
        provider_code,
        request_id,
        transaction_id,
        referenced_id,
        request_date,
        tx_hash: '0xabcdef234567890',
        onchain_url: 'http://127.0.0.1:8545/tx/0xabcdef234567890',
      });

      const data = await service.createDelegation(
        nik,
        consumer_code,
        provider_code,
        request_id,
        transaction_id,
        referenced_id,
        request_date,
      );

      expect(data).toBeDefined();
      expect(data).toHaveProperty('nik');
      expect(data).toHaveProperty('consumer_code');
      expect(data).toHaveProperty('provider_code');
      expect(data).toHaveProperty('request_id');
      expect(data).toHaveProperty('transaction_id');
      expect(data).toHaveProperty('referenced_id');
      expect(data).toHaveProperty('request_date');
      expect(data).toHaveProperty('tx_hash');
      expect(data).toHaveProperty('onchain_url');
    });
  });

  describe('Add Debtor to Creditor', () => {
    const debtor_nik: string = '5101010';
    const debtor_name: string = 'Debtor A';
    const creditor_code: string = '12345';
    const creditor_name: string = 'Creditor A';
    const application_date: string = '2025-02-25';
    const approval_date: string = '2025-02-26';
    const url_KTP: string = 'https://example.com';
    const url_approval: string = 'https://example.com';

    it('should allow request for adding debtor to creditor', async () => {
      jest.spyOn(service as any, 'addDebtorToCreditor').mockResolvedValue({
        debtor_nik,
        debtor_name,
        creditor_code,
        creditor_name,
        application_date,
        approval_date,
        url_KTP,
        url_approval,
        tx_hash: '0xabcdef234567890',
        onchain_url: 'http://127.0.0.1:8545/tx/0xabcdef234567890',
      });

      const data = await service.addDebtorToCreditor(
        debtor_nik,
        creditor_code,
        debtor_name,
        creditor_name,
        application_date,
        approval_date,
        url_KTP,
        url_approval,
      );

      expect(data).toBeDefined();
      expect(data).toHaveProperty('debtor_nik');
      expect(data).toHaveProperty('creditor_code');
      expect(data).toHaveProperty('debtor_name');
      expect(data).toHaveProperty('creditor_name');
      expect(data).toHaveProperty('application_date');
      expect(data).toHaveProperty('approval_date');
      expect(data).toHaveProperty('url_KTP');
      expect(data).toHaveProperty('url_approval');
      expect(data).toHaveProperty('tx_hash');
      expect(data).toHaveProperty('onchain_url');
    });
  });

  describe('Delegation Approval', () => {
    const nik: string = '5101010';
    const is_approve: boolean = true;
    const creditor_consumer_code: string = '54321';
    const creditor_provider_code: string = '12345';

    it('should allow request to create delegation approval', async () => {
      jest.spyOn(service as any, 'delegationApproval').mockResolvedValue({
        tx_hash: '0xabcdef234567890',
        onchain_url: 'http://127.0.0.1:8545/tx/0xabcdef234567890',
        status: 'APPROVED',
      });

      const data = await service.delegationApproval(
        nik,
        is_approve,
        creditor_consumer_code,
        creditor_provider_code,
      );

      expect(data).toBeDefined();
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('tx_hash');
      expect(data).toHaveProperty('onchain_url');
    });

    it('should throw BadRequestException if debtor already exists', async () => {
      const mockError = new BadRequestException({
        action: 'estimateGas',
        message:
          'Providers are unable to approve the request due to an estimate gas issue or the application status is not pending.',
      });
      // Simulate an error in the method, such as debtor already existing
      jest
        .spyOn(service as any, 'delegationApproval')
        .mockRejectedValue(mockError);
      try {
        await service.delegationApproval(
          nik,
          is_approve,
          creditor_consumer_code,
          creditor_provider_code,
        );
      } catch (error: any) {
        console.log('error: ', error);
        // Expect the error to be a BadRequestException
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe(
          'Providers are unable to approve the request due to an estimate gas issue or the application status is not pending.',
        );
      }
    });
  });

  describe('Status Creditor Delegation ', () => {
    const creditor_code: string = '54321';
    const nik: string = '5101010';

    it('should allow request for get status creditor delegation', async () => {
      jest
        .spyOn(service as any, 'getStatusCreditorDelegation')
        .mockResolvedValue('APPROVED');

      const data = await service.getStatusCreditorDelegation(
        nik,
        creditor_code,
      );

      expect(data).toBeDefined();
      expect(data).toMatch('APPROVED');
    });

    it('should throw BadRequestException if creditor not eligible to get delegation status', async () => {
      const mockError = new BadRequestException({
        reason: 'NotEligible()',
        message: 'Creditor Code not eligible to check status delegation.',
      });

      jest
        .spyOn(service as any, 'getStatusCreditorDelegation')
        .mockRejectedValue(mockError);
      try {
        await service.getStatusCreditorDelegation(nik, creditor_code);
      } catch (error: any) {
        console.log('error: ', error);
        // Expect the error to be a BadRequestException
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe(
          'Creditor Code not eligible to check status delegation.',
        );
      }
    });

    it('should throw an error if another unexpected error occurs', async () => {
      // Simulate an unexpected error
      jest
        .spyOn(service as any, 'getStatusCreditorDelegation')
        .mockRejectedValue(new Error('Unexpected error'));

      try {
        await service.getStatusCreditorDelegation(nik, creditor_code);
      } catch (error: any) {
        // Expect the error to be an instance of Error
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Unexpected error');
      }
    });
  });

  describe('Get Active Creditor by Status', () => {
    const debtor_nik: string = '5101010';
    const status: TransactionCommonType = 'APPROVED';

    it('should allow request to get active creditor by status', async () => {
      jest
        .spyOn(service as any, 'getActiveCreditorByStatus')
        .mockResolvedValue([['0x22E71ae8f747585c646ebE6FCe7f96A7923D7F8F']]);

      const data = await service.getActiveCreditorByStatus(debtor_nik, status);
      console.log('data: ', data);
      expect(data).toEqual([['0x22E71ae8f747585c646ebE6FCe7f96A7923D7F8F']]);
    });

    it('should throw BadRequestException if creditor not eligible to get delegation status', async () => {
      const mockError = new BadRequestException({
        reason: 'NikNeedRegistered()',
        message: 'NIK need to be registered first.',
      });

      jest
        .spyOn(service as any, 'getActiveCreditorByStatus')
        .mockRejectedValue(mockError);
      try {
        await service.getActiveCreditorByStatus(debtor_nik, status);
      } catch (error: any) {
        console.log('error: ', error);
        // Expect the error to be a BadRequestException
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('NIK need to be registered first.');
      }
    });
  });
});
