import { Test, TestingModule } from '@nestjs/testing';
import { EthersService } from './ethers';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ContractTransactionReceipt,
  ContractTransactionResponse,
  ethers,
  Wallet,
} from 'ethers';
import {
  generateTestAddDebtorToCreditorData,
  generateTestCreditorData,
} from '../../utils/test/creditor-test';
import { regexPattern } from '../../utils/type/regex.type';
import { IsApprove } from '../../model/creditor/util/creditor-type.service';
import { StatusCreditorDelegation } from '../../utils/enum';

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

describe('EthersService', () => {
  let ethersService: EthersService;

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
        RPC_URL: 'http://127.0.0.1:8545/', // Mocked RPC URL
        PRIVATE_KEY: '0xmockedPrivateKey', // Mocked Private Key
        CONTRACT_ADDRESS: '0xmockedContractAddress', // Mocked Contract Address
      };

      return configValue[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EthersService,
        { provide: Logger, useValue: mockLogger },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    ethersService = module.get<EthersService>(EthersService);

    // Mocked Method
    jest.spyOn(ethersService as any, 'generateHDNodeWallet').mockReturnValue({
      address: '0xmockedWalletAddress',
      privateKey: '0xmockedPrivateKey',
    });

    jest.spyOn(ethersService as any, 'getEIP712Domain').mockResolvedValue({
      name: 'DataSharing',
      version: '1',
      chainId: BigInt(1),
      verifyingContract: '0xmockedContractAddress',
    });
  });

  it('should be defined', () => {
    expect(ethersService).toBeDefined();
  });

  it('should generate wallet', () => {
    const wallet = (ethersService as any).generateHDNodeWallet();
    expect(wallet).toHaveProperty('address', '0xmockedWalletAddress');
    expect(wallet).toHaveProperty('privateKey', '0xmockedPrivateKey');
  });

  it('should generate wallet with private key', () => {
    const wallet = (ethersService as any).generateHDNodeWallet();

    // test for generate wallet using private key
    const walletPrivateKey = (
      ethersService as any
    ).generateWalletWithPrivateKey(wallet.privateKey);

    expect(walletPrivateKey).toBeDefined();
    expect(walletPrivateKey).toHaveProperty('address');
    expect(walletPrivateKey).toHaveProperty('privateKey');
  });

  it('should get EIP712 Domain', async () => {
    const domain = await ethersService['getEIP712Domain'](); // Access private method
    expect(domain).toEqual({
      name: 'DataSharing',
      version: '1',
      chainId: expect.any(BigInt),
      verifyingContract: expect.any(String),
    });
  });

  describe('Creditor Section', () => {
    describe('Add Creditor', () => {
      let creditor_privateKey: string;
      let creditor_code: string;
      let creditor_wallet: Wallet;

      beforeEach(async () => {
        // spying method
        jest
          .spyOn(ethersService as any, 'generateHDNodeWallet')
          .mockReturnValue({
            address: '0xMockedAddress',
            privateKey: '0xMockedPrivateKey',
          });

        jest
          .spyOn(ethersService as any, 'generateWalletWithPrivateKey')
          .mockResolvedValue({
            provider: null,
            address: '0x1234567890123456789012345678901234567890',
          });

        // Generate mock data for creditor_code

        creditor_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        creditor_wallet = (ethersService as any).generateWalletWithPrivateKey(
          creditor_privateKey,
        );
        creditor_code = Math.floor(
          1000000000 + Math.random() * 9000000000,
        ).toString();
      });

      it('should accept add creditor', async () => {
        jest.spyOn(ethersService as any, 'addCreditor').mockResolvedValue({
          provider: 'JsonRpcProvider {}' as any,
          to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
          from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          contractAddress: null,
          hash: '0x20729a4ea04293732a86ff5fd1d7753f1cd726572e658e2a64ffd5e782594140',
          index: 0,
          blockHash:
            '0xa7f9fc9a96a3361f772e86eedd5be56e19fd36badb97c7501ea0ffc73f2241ca',
          blockNumber: 12,
          logsBloom:
            '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000004000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000020000000000000000000000000000000000000000000000000000080040000000000000000000000000000010000000000000100000000000008000000000000000000000000000000000000000000000000000000000002000',
          gasUsed: 80595n,
          blobGasUsed: null,
          cumulativeGasUsed: 80595n,
          gasPrice: 1207245320n,
          blobGasPrice: null,
          type: 2,
          status: 1,
          root: undefined,
        });

        // Call the addCreditor method
        const creditor: ContractTransactionReceipt =
          await ethersService.addCreditor(creditor_code, creditor_wallet);

        // Assert the expected properties are present
        expect(creditor).toBeDefined();
        expect(creditor).toHaveProperty('provider');
        expect(creditor).toHaveProperty('to');
        expect(creditor).toHaveProperty('from');
        expect(creditor).toHaveProperty('contractAddress');
        expect(creditor).toHaveProperty('hash');
        expect(creditor).toHaveProperty('index');
        expect(creditor).toHaveProperty('blockHash');
        expect(creditor).toHaveProperty('blockNumber');
      });
    });

    describe('Add Creditor With Event', () => {
      let privateKey: string;
      let creditor_wallet: Wallet;
      let creditor_code: string;
      let institution_code: string;
      let institution_name: string;
      let approval_date: string;
      let signer_name: string;
      let signer_position: string;

      beforeEach(async () => {
        // spying method
        jest
          .spyOn(ethersService as any, 'generateHDNodeWallet')
          .mockReturnValue({
            address: '0xMockedAddress',
            privateKey: '0xMockedPrivateKey',
          });

        jest
          .spyOn(ethersService as any, 'generateWalletWithPrivateKey')
          .mockResolvedValue({
            provider: null,
            address: '0x1234567890123456789012345678901234567890',
          });

        // Generate mock data for creditor_code

        privateKey = (ethersService as any).generateHDNodeWallet().address;
        creditor_wallet = (ethersService as any).generateWalletWithPrivateKey(
          privateKey,
        );
        creditor_code = Math.floor(
          1000000000 + Math.random() * 9000000000,
        ).toString();

        const test_data = generateTestCreditorData();
        institution_code = test_data.institution_code;
        institution_name = test_data.institution_name;
        approval_date = test_data.approval_date;
        signer_name = test_data.signer_name;
        signer_position = test_data.signer_position;
      });

      it('should accept add creditor with event', async () => {
        jest
          .spyOn(ethersService as any, 'addCreditorWithEvent')
          .mockResolvedValue({
            to: '0xMockedAddressTo',
            from: '0xMockedAddressFrom',
            hash: '0xMockedHash',
            nonce: 1,
            gasLimit: 100000,
          } as unknown as ContractTransactionReceipt);

        const creditor = await ethersService.addCreditorWithEvent(
          creditor_code,
          creditor_wallet,
          institution_code,
          institution_name,
          approval_date,
          signer_name,
          signer_position,
        );

        expect(creditor).toBeDefined();
        expect(creditor).toHaveProperty('gasLimit');
        expect(creditor).toHaveProperty('to');
        expect(creditor).toHaveProperty('from');
        expect(creditor).toHaveProperty('nonce');
        expect(creditor).toHaveProperty('hash');
      });
    });

    describe('Remove Creditor', () => {
      let creditor_address: Wallet;
      let creditor_code: string;
      let institution_code: string;
      let institution_name: string;
      let approval_date: string;
      let signer_name: string;
      let signer_position: string;

      beforeEach(async () => {
        // spying method
        jest
          .spyOn(ethersService as any, 'generateHDNodeWallet')
          .mockReturnValue({
            address: '0xMockedAddress',
            privateKey: '0xMockedPrivateKey',
          });

        jest
          .spyOn(ethersService as any, 'generateWalletWithPrivateKey')
          .mockResolvedValue({
            provider: null,
            address: '0x1234567890123456789012345678901234567890',
          });

        jest
          .spyOn(ethersService as any, 'addCreditorWithEvent')
          .mockResolvedValue({
            to: '0xMockedAddressTo',
            from: '0xMockedAddressFrom',
            hash: '0xMockedHash',
            nonce: 1,
            gasLimit: 100000,
          } as unknown as ContractTransactionReceipt);

        creditor_code = Math.floor(
          1000000000 + Math.random() * 9000000000,
        ).toString();

        const test_data = generateTestCreditorData();
        institution_code = test_data.institution_code;
        institution_name = test_data.institution_name;
        approval_date = test_data.approval_date;
        signer_name = test_data.signer_name;
        signer_position = test_data.signer_position;

        await ethersService.addCreditorWithEvent(
          creditor_code,
          creditor_address,
          institution_code,
          institution_name,
          approval_date,
          signer_name,
          signer_position,
        );
      });

      it('should accept to remove creditor', async () => {
        jest.spyOn(ethersService, 'removeCreditor').mockResolvedValue({
          to: '0xMockedAddressTo',
          from: '0xMockedAddressFrom',
          hash: '0xMockedHash',
          nonce: 1,
          gasLimit: 100000,
        } as unknown as ethers.ContractTransactionResponse);

        const creditor = await ethersService.removeCreditor(creditor_code);
        expect(creditor).toBeDefined();
        expect(creditor).toHaveProperty('to');
        expect(creditor).toHaveProperty('from');
        expect(creditor).toHaveProperty('hash');
        expect(creditor).toHaveProperty('nonce');
        expect(creditor).toHaveProperty('gasLimit');
      });
    });

    describe('Get Creditor', () => {
      let creditor_address: Wallet;
      let creditor_code: string;
      let institution_code: string;
      let institution_name: string;
      let approval_date: string;
      let signer_name: string;
      let signer_position: string;

      beforeEach(async () => {
        jest
          .spyOn(ethersService as any, 'generateHDNodeWallet')
          .mockReturnValue({
            address: '0xMockedWalletAddress',
            privateKey: '0xMockedPrivateKey',
          });

        creditor_code = Math.floor(
          1000000000 + Math.random() * 9000000000,
        ).toString();

        const test_data = generateTestCreditorData();
        institution_code = test_data.institution_code;
        institution_name = test_data.institution_name;
        approval_date = test_data.approval_date;
        signer_name = test_data.signer_name;
        signer_position = test_data.signer_position;

        jest
          .spyOn(ethersService as any, 'addCreditorWithEvent')
          .mockResolvedValue({
            to: '0xMockedAddressTo',
            from: '0xMockedAddressFrom',
            hash: '0xMockedHash',
            nonce: 1,
            gasLimit: 100000,
          } as unknown as ethers.ContractTransactionResponse);

        await ethersService.addCreditorWithEvent(
          creditor_code,
          creditor_address,
          institution_code,
          institution_name,
          approval_date,
          signer_name,
          signer_position,
        );
      });

      it('should accept get creditor', async () => {
        jest.spyOn(ethersService, 'getCreditor').mockResolvedValue({
          wallet_address: '0xa1b2c3d4e5f67890123456789abcdefabcdef123',
        } as unknown as ethers.ContractTransactionResponse);
        const creditor = await ethersService.getCreditor(creditor_code);
        expect(creditor).toBeDefined();
        expect(creditor).toHaveProperty('wallet_address');
        expect(creditor.wallet_address.toLowerCase()).toMatch(
          regexPattern.walletPattern,
        );
      });
    });

    describe('Add Debtor to Creditor', () => {
      // creditor
      let creditor_wallet: Wallet;
      let privateKey: string;
      let creditor_code: string;
      let institution_code: string;
      let institution_name: string;
      let signer_name: string;
      let signer_position: string;
      let debtor_name: string;
      let creditor_name: string;
      let application_date: string;
      let approval_date: string;
      let url_KTP: string;
      let url_approval: string;

      // debtor
      let debtor_nik: string;
      let debtor_privateKey: string;
      let debtor_wallet: Wallet;

      beforeEach(async () => {
        jest
          .spyOn(ethersService as any, 'generateHDNodeWallet')
          .mockReturnValue({
            address: '0xMockedWalletAddress',
            privateKey: '0xMockedPrivateKey',
          });
        debtor_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        debtor_wallet = (ethersService as any).generateWalletWithPrivateKey(
          debtor_privateKey,
        );

        debtor_nik = Math.floor(
          1000000000 + Math.random() * 9000000000,
        ).toString();
        await ethersService.addDebtor(debtor_nik, debtor_wallet);

        privateKey = (ethersService as any).generateHDNodeWallet().privateKey;
        creditor_wallet = (ethersService as any).generateWalletWithPrivateKey(
          privateKey,
        );

        creditor_code = Math.floor(
          1000000000 + Math.random() * 9000000000,
        ).toString();

        const test_data = generateTestCreditorData();
        institution_code = test_data.institution_code;
        institution_name = test_data.institution_name;
        approval_date = test_data.approval_date;
        signer_name = test_data.signer_name;
        signer_position = test_data.signer_position;

        jest
          .spyOn(ethersService as any, 'addCreditorWithEvent')
          .mockResolvedValue({
            to: '0xMockedAddressTo',
            from: '0xMockedAddressFrom',
            hash: '0xMockedHash',
            nonce: 1,
            gasLimit: 100000,
          } as unknown as ethers.ContractTransactionResponse);

        await ethersService.addCreditorWithEvent(
          creditor_code,
          creditor_wallet,
          institution_code,
          institution_name,
          approval_date,
          signer_name,
          signer_position,
        );

        const addDebtorToCreditor = generateTestAddDebtorToCreditorData();
        creditor_name = institution_name;
        debtor_name = addDebtorToCreditor.debtor_name;
        application_date = addDebtorToCreditor.application_date;
        url_KTP = addDebtorToCreditor.url_KTP;
        url_approval = addDebtorToCreditor.url_approval;
      }, 50000);

      it('should accept add debtor to creditor', async () => {
        jest
          .spyOn(ethersService as any, 'addDebtorToCreditor')
          .mockResolvedValue({
            to: '0xMockedAddressTo',
            from: '0xMockedAddressFrom',
            hash: '0xMockedHash',
            nonce: 1,
            gasLimit: 100000,
          } as unknown as ethers.ContractTransactionResponse);
        const data = await ethersService.addDebtorToCreditor(
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
        expect(data).toHaveProperty('from');
        expect(data).toHaveProperty('to');
        expect(data).toHaveProperty('gasLimit');
        expect(data).toHaveProperty('nonce');
        expect(data).toHaveProperty('hash');
      }, 50000);
    });

    describe('Request Delegation', () => {
      // debtor
      let nik: string;
      let debtor_name: string;
      let debtor_wallet: Wallet;
      let debtor_privateKey: string;

      //creditor
      let consumer_code: string;
      let consumer_institution_code: string;
      let consumer_institution_name: string;
      let consumer_approval_date: string;
      let consumer_signer_name: string;
      let consumer_signer_position: string;
      let consumer_wallet: Wallet;
      let consumer_privateKey: string;

      // provider
      let provider_code: string;
      let provider_institution_code: string;
      let provider_institution_name: string;
      let provider_approval_date: string;
      let provider_signer_name: string;
      let provider_signer_position: string;
      let provider_name: string;
      let provider_wallet: Wallet;
      let provider_privateKey: string;

      let application_date: string;
      let approval_date: string;
      let url_KTP: string;
      let url_approval: string;

      beforeEach(async () => {
        // spying on ethersService
        jest
          .spyOn(ethersService as any, 'generateHDNodeWallet')
          .mockReturnValue({
            address: '0xMockedWalletAddress',
            privateKey: '0xMockedPrivateKey',
          });

        jest
          .spyOn(ethersService as any, 'generateWalletWithPrivateKey')
          .mockResolvedValue({
            provider: null,
            address: '0x1234567890123456789012345678901234567890',
          });

        // add debtor
        debtor_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        debtor_wallet = (ethersService as any).generateWalletWithPrivateKey(
          debtor_privateKey,
        );

        nik = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        await ethersService.addDebtor(nik, debtor_wallet);

        // add creditor (provider)
        provider_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        provider_wallet = (ethersService as any).generateWalletWithPrivateKey(
          provider_privateKey,
        );

        provider_code = Math.floor(
          1000000000 + Math.random() * 9000000000,
        ).toString();

        const provider = generateTestCreditorData();
        provider_institution_code = provider.institution_code;
        provider_institution_name = provider.institution_name;
        provider_approval_date = provider.approval_date;
        provider_signer_name = provider.signer_name;
        provider_signer_position = provider.signer_position;
        await ethersService.addCreditorWithEvent(
          provider_code,
          provider_wallet,
          provider_institution_code,
          provider_institution_name,
          provider_approval_date,
          provider_signer_name,
          provider_signer_position,
        );

        // add creditor (consumer)
        consumer_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        consumer_wallet = (ethersService as any).generateWalletWithPrivateKey(
          consumer_privateKey,
        );

        consumer_code = Math.floor(
          1000000000 + Math.random() * 9000000000,
        ).toString();

        const consumer = generateTestCreditorData();
        consumer_institution_code = consumer.institution_code;
        consumer_institution_name = consumer.institution_name;
        consumer_approval_date = consumer.approval_date;
        consumer_signer_name = consumer.signer_name;
        consumer_signer_position = consumer.signer_position;

        provider_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        provider_wallet = (ethersService as any).generateWalletWithPrivateKey(
          provider_privateKey,
        );
        await ethersService.addCreditorWithEvent(
          consumer_code,
          consumer_wallet,
          consumer_institution_code,
          consumer_institution_name,
          consumer_approval_date,
          consumer_signer_name,
          consumer_signer_position,
        );

        // add debtor to provider
        const addDebtorToCreditor = generateTestAddDebtorToCreditorData();
        debtor_name = addDebtorToCreditor.debtor_name;
        provider_name = addDebtorToCreditor.creditor_name;
        application_date = addDebtorToCreditor.application_date;
        url_KTP = addDebtorToCreditor.url_KTP;
        url_approval = addDebtorToCreditor.url_approval;

        await ethersService.addDebtorToCreditor(
          nik,
          provider_code,
          debtor_name,
          provider_name,
          application_date,
          approval_date,
          url_KTP,
          url_approval,
        );
      }, 50000);

      it('should accept request delegation', async () => {
        jest
          .spyOn(ethersService as any, 'requestDelegation')
          .mockResolvedValue({
            provider: 'JsonRpcProvider {}',
            to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
            from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            contractAddress: null,
            hash: '0x4e49c2270783c958fc9b8b039841c935661fb4d7ca59ca2c4a612f92f68b518b',
            index: 0,
            blockHash:
              '0x4586155dc31c41394a310b3eb37a2af834f50e074844adbe510e215bf64839d5',
            blockNumber: 6,
          } as unknown as ContractTransactionReceipt);
        const data = await ethersService.requestDelegation(
          nik,
          consumer_code,
          provider_code,
        );

        expect(data).toBeDefined();
        expect(data).toHaveProperty('provider');
        expect(data).toHaveProperty('to');
        expect(data).toHaveProperty('from');
        expect(data).toHaveProperty('contractAddress');
        expect(data).toHaveProperty('hash');
        expect(data).toHaveProperty('index');
        expect(data).toHaveProperty('blockHash');
        expect(data).toHaveProperty('blockNumber');
      }, 50000);
    });

    describe('Request Delegation With Event', () => {
      // debtor
      let nik: string;
      let debtor_name: string;
      let debtor_wallet: Wallet;
      let debtor_privateKey: string;

      //creditor
      let consumer_code: string;
      let consumer_institution_code: string;
      let consumer_institution_name: string;
      let consumer_approval_date: string;
      let consumer_signer_name: string;
      let consumer_signer_position: string;
      let consumer_wallet: Wallet;
      let consumer_privateKey: string;

      // provider
      let provider_code: string;
      let provider_institution_code: string;
      let provider_institution_name: string;
      let provider_approval_date: string;
      let provider_signer_name: string;
      let provider_signer_position: string;
      let provider_name: string;
      let provider_wallet: Wallet;
      let provider_privateKey: string;

      let application_date: string;
      let approval_date: string;
      let url_KTP: string;
      let url_approval: string;

      beforeEach(async () => {
        // spying on ethersService
        jest
          .spyOn(ethersService as any, 'generateHDNodeWallet')
          .mockReturnValue({
            address: '0xMockedWalletAddress',
            privateKey: '0xMockedPrivateKey',
          });

        jest
          .spyOn(ethersService as any, 'generateWalletWithPrivateKey')
          .mockResolvedValue({
            provider: null,
            address: '0x1234567890123456789012345678901234567890',
          });

        // add debtor
        debtor_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        debtor_wallet = (ethersService as any).generateWalletWithPrivateKey(
          debtor_privateKey,
        );

        nik = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        await ethersService.addDebtor(nik, debtor_wallet);

        // add creditor (provider)
        provider_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        provider_wallet = (ethersService as any).generateWalletWithPrivateKey(
          provider_privateKey,
        );

        provider_code = Math.floor(
          1000000000 + Math.random() * 9000000000,
        ).toString();

        const provider = generateTestCreditorData();
        provider_institution_code = provider.institution_code;
        provider_institution_name = provider.institution_name;
        provider_approval_date = provider.approval_date;
        provider_signer_name = provider.signer_name;
        provider_signer_position = provider.signer_position;
        await ethersService.addCreditorWithEvent(
          provider_code,
          provider_wallet,
          provider_institution_code,
          provider_institution_name,
          provider_approval_date,
          provider_signer_name,
          provider_signer_position,
        );

        // add creditor (consumer)
        consumer_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        consumer_wallet = (ethersService as any).generateWalletWithPrivateKey(
          consumer_privateKey,
        );

        consumer_code = Math.floor(
          1000000000 + Math.random() * 9000000000,
        ).toString();

        const consumer = generateTestCreditorData();
        consumer_institution_code = consumer.institution_code;
        consumer_institution_name = consumer.institution_name;
        consumer_approval_date = consumer.approval_date;
        consumer_signer_name = consumer.signer_name;
        consumer_signer_position = consumer.signer_position;

        provider_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        provider_wallet = (ethersService as any).generateWalletWithPrivateKey(
          provider_privateKey,
        );
        await ethersService.addCreditorWithEvent(
          consumer_code,
          consumer_wallet,
          consumer_institution_code,
          consumer_institution_name,
          consumer_approval_date,
          consumer_signer_name,
          consumer_signer_position,
        );

        // add debtor to provider
        const addDebtorToCreditor = generateTestAddDebtorToCreditorData();
        debtor_name = addDebtorToCreditor.debtor_name;
        provider_name = addDebtorToCreditor.creditor_name;
        application_date = addDebtorToCreditor.application_date;
        url_KTP = addDebtorToCreditor.url_KTP;
        url_approval = addDebtorToCreditor.url_approval;

        await ethersService.addDebtorToCreditor(
          nik,
          provider_code,
          debtor_name,
          provider_name,
          application_date,
          approval_date,
          url_KTP,
          url_approval,
        );
      }, 50000);

      it('should accept request delegation with event', async () => {
        jest
          .spyOn(ethersService as any, 'requestDelegationWithEvent')
          .mockResolvedValue({
            provider: 'JsonRpcProvider {}',
            to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
            from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            contractAddress: null,
            hash: '0x4e49c2270783c958fc9b8b039841c935661fb4d7ca59ca2c4a612f92f68b518b',
            index: 0,
            blockHash:
              '0x4586155dc31c41394a310b3eb37a2af834f50e074844adbe510e215bf64839d5',
            blockNumber: 6,
          } as unknown as ContractTransactionReceipt);
        const data = await ethersService.requestDelegationWithEvent(
          nik,
          consumer_code,
          provider_code,
          '1',
          '1',
          '1',
          '2025-02-02',
        );

        expect(data).toBeDefined();
        expect(data).toHaveProperty('provider');
        expect(data).toHaveProperty('to');
        expect(data).toHaveProperty('from');
        expect(data).toHaveProperty('contractAddress');
        expect(data).toHaveProperty('hash');
        expect(data).toHaveProperty('index');
        expect(data).toHaveProperty('blockHash');
        expect(data).toHaveProperty('blockNumber');
      }, 50000);
    });

    describe('Approve Delegation', () => {
      // debtor
      let nik: string;
      let debtor_name: string;
      let debtor_wallet: Wallet;
      let debtor_privateKey: string;

      //creditor
      let consumer_code: string;
      let consumer_institution_code: string;
      let consumer_institution_name: string;
      let consumer_approval_date: string;
      let consumer_signer_name: string;
      let consumer_signer_position: string;
      let consumer_wallet: Wallet;
      let consumer_privateKey: string;

      // provider
      let provider_code: string;
      let provider_institution_code: string;
      let provider_institution_name: string;
      let provider_approval_date: string;
      let provider_signer_name: string;
      let provider_signer_position: string;
      let provider_name: string;
      let provider_wallet: Wallet;
      let provider_privateKey: string;

      let application_date: string;
      let approval_date: string;
      let url_KTP: string;
      let url_approval: string;

      beforeEach(async () => {
        // spying on ethersService
        jest
          .spyOn(ethersService as any, 'generateHDNodeWallet')
          .mockReturnValue({
            address: '0xMockedWalletAddress',
            privateKey: '0xMockedPrivateKey',
          });

        jest
          .spyOn(ethersService as any, 'generateWalletWithPrivateKey')
          .mockResolvedValue({
            provider: null,
            address: '0x1234567890123456789012345678901234567890',
          });

        // add debtor
        debtor_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        debtor_wallet = (ethersService as any).generateWalletWithPrivateKey(
          debtor_privateKey,
        );

        nik = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        await ethersService.addDebtor(nik, debtor_wallet);

        // add creditor (provider)
        provider_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        provider_wallet = (ethersService as any).generateWalletWithPrivateKey(
          provider_privateKey,
        );

        provider_code = Math.floor(
          1000000000 + Math.random() * 9000000000,
        ).toString();

        const provider = generateTestCreditorData();
        provider_institution_code = provider.institution_code;
        provider_institution_name = provider.institution_name;
        provider_approval_date = provider.approval_date;
        provider_signer_name = provider.signer_name;
        provider_signer_position = provider.signer_position;
        await ethersService.addCreditorWithEvent(
          provider_code,
          provider_wallet,
          provider_institution_code,
          provider_institution_name,
          provider_approval_date,
          provider_signer_name,
          provider_signer_position,
        );

        // add creditor (consumer)
        consumer_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        consumer_wallet = (ethersService as any).generateWalletWithPrivateKey(
          consumer_privateKey,
        );

        consumer_code = Math.floor(
          1000000000 + Math.random() * 9000000000,
        ).toString();

        const consumer = generateTestCreditorData();
        consumer_institution_code = consumer.institution_code;
        consumer_institution_name = consumer.institution_name;
        consumer_approval_date = consumer.approval_date;
        consumer_signer_name = consumer.signer_name;
        consumer_signer_position = consumer.signer_position;

        provider_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        provider_wallet = (ethersService as any).generateWalletWithPrivateKey(
          provider_privateKey,
        );
        await ethersService.addCreditorWithEvent(
          consumer_code,
          consumer_wallet,
          consumer_institution_code,
          consumer_institution_name,
          consumer_approval_date,
          consumer_signer_name,
          consumer_signer_position,
        );

        // add debtor to provider
        const addDebtorToCreditor = generateTestAddDebtorToCreditorData();
        debtor_name = addDebtorToCreditor.debtor_name;
        provider_name = addDebtorToCreditor.creditor_name;
        application_date = addDebtorToCreditor.application_date;
        url_KTP = addDebtorToCreditor.url_KTP;
        url_approval = addDebtorToCreditor.url_approval;

        await ethersService.addDebtorToCreditor(
          nik,
          provider_code,
          debtor_name,
          provider_name,
          application_date,
          approval_date,
          url_KTP,
          url_approval,
        );

        await ethersService.requestDelegationWithEvent(
          nik,
          consumer_code,
          provider_code,
          '1',
          '1',
          '1',
          '2025-02-02',
        );
      }, 50000);

      it('should accept approval delegation', async () => {
        jest
          .spyOn(ethersService as any, 'approveDelegation')
          .mockResolvedValue({
            provider: 'JsonRpcProvider {}',
            to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
            from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            contractAddress: null,
            hash: '0x4e49c2270783c958fc9b8b039841c935661fb4d7ca59ca2c4a612f92f68b518b',
            index: 0,
            blockHash:
              '0x4586155dc31c41394a310b3eb37a2af834f50e074844adbe510e215bf64839d5',
            blockNumber: 6,
          } as unknown as ContractTransactionReceipt);

        const data = await ethersService.approveDelegation(
          nik,
          consumer_code,
          provider_code,
          IsApprove.APPROVED,
        );

        expect(data).toBeDefined();
        expect(data).toHaveProperty('provider');
        expect(data).toHaveProperty('to');
        expect(data).toHaveProperty('from');
        expect(data).toHaveProperty('contractAddress');
        expect(data).toHaveProperty('hash');
        expect(data).toHaveProperty('index');
        expect(data).toHaveProperty('blockHash');
        expect(data).toHaveProperty('blockNumber');
      });
    });

    describe('Get Status Delegation', () => {
      // debtor
      let nik: string;
      let debtor_name: string;
      let debtor_wallet: Wallet;
      let debtor_privateKey: string;

      //creditor
      let consumer_code: string;
      let consumer_institution_code: string;
      let consumer_institution_name: string;
      let consumer_approval_date: string;
      let consumer_signer_name: string;
      let consumer_signer_position: string;
      let consumer_wallet: Wallet;
      let consumer_privateKey: string;

      // provider
      let provider_code: string;
      let provider_institution_code: string;
      let provider_institution_name: string;
      let provider_approval_date: string;
      let provider_signer_name: string;
      let provider_signer_position: string;
      let provider_name: string;
      let provider_wallet: Wallet;
      let provider_privateKey: string;

      let application_date: string;
      let approval_date: string;
      let url_KTP: string;
      let url_approval: string;

      beforeEach(async () => {
        // spying on ethersService
        jest
          .spyOn(ethersService as any, 'generateHDNodeWallet')
          .mockReturnValue({
            address: '0xMockedWalletAddress',
            privateKey: '0xMockedPrivateKey',
          });

        jest
          .spyOn(ethersService as any, 'generateWalletWithPrivateKey')
          .mockResolvedValue({
            provider: null,
            address: '0x1234567890123456789012345678901234567890',
          });

        // add debtor
        debtor_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        debtor_wallet = (ethersService as any).generateWalletWithPrivateKey(
          debtor_privateKey,
        );

        nik = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        await ethersService.addDebtor(nik, debtor_wallet);

        // add creditor (provider)
        provider_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        provider_wallet = (ethersService as any).generateWalletWithPrivateKey(
          provider_privateKey,
        );

        provider_code = Math.floor(
          1000000000 + Math.random() * 9000000000,
        ).toString();

        const provider = generateTestCreditorData();
        provider_institution_code = provider.institution_code;
        provider_institution_name = provider.institution_name;
        provider_approval_date = provider.approval_date;
        provider_signer_name = provider.signer_name;
        provider_signer_position = provider.signer_position;
        await ethersService.addCreditorWithEvent(
          provider_code,
          provider_wallet,
          provider_institution_code,
          provider_institution_name,
          provider_approval_date,
          provider_signer_name,
          provider_signer_position,
        );

        // add creditor (consumer)
        consumer_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        consumer_wallet = (ethersService as any).generateWalletWithPrivateKey(
          consumer_privateKey,
        );

        consumer_code = Math.floor(
          1000000000 + Math.random() * 9000000000,
        ).toString();

        const consumer = generateTestCreditorData();
        consumer_institution_code = consumer.institution_code;
        consumer_institution_name = consumer.institution_name;
        consumer_approval_date = consumer.approval_date;
        consumer_signer_name = consumer.signer_name;
        consumer_signer_position = consumer.signer_position;

        provider_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        provider_wallet = (ethersService as any).generateWalletWithPrivateKey(
          provider_privateKey,
        );
        await ethersService.addCreditorWithEvent(
          consumer_code,
          consumer_wallet,
          consumer_institution_code,
          consumer_institution_name,
          consumer_approval_date,
          consumer_signer_name,
          consumer_signer_position,
        );

        // add debtor to provider
        const addDebtorToCreditor = generateTestAddDebtorToCreditorData();
        debtor_name = addDebtorToCreditor.debtor_name;
        provider_name = addDebtorToCreditor.creditor_name;
        application_date = addDebtorToCreditor.application_date;
        url_KTP = addDebtorToCreditor.url_KTP;
        url_approval = addDebtorToCreditor.url_approval;

        await ethersService.addDebtorToCreditor(
          nik,
          provider_code,
          debtor_name,
          provider_name,
          application_date,
          approval_date,
          url_KTP,
          url_approval,
        );

        await ethersService.requestDelegationWithEvent(
          nik,
          consumer_code,
          provider_code,
          '1',
          '1',
          '1',
          '2025-02-02',
        );

        await ethersService.approveDelegation(
          nik,
          consumer_code,
          provider_code,
          IsApprove.APPROVED,
        );
      }, 50000);

      it('should accept get status creditor delegation', async () => {
        jest
          .spyOn(ethersService as any, 'getStatusDelegation')
          .mockResolvedValue(3n as bigint);

        const debtor = await ethersService.getStatusDelegation(
          nik,
          consumer_code,
        );

        expect(debtor).toBeDefined();
        expect(typeof debtor).toBe('bigint');
      });
    });

    describe('Purchase Package', () => {
      let creditor_address: Wallet;
      let creditor_code: string;
      let institution_code: string;
      let institution_name: string;
      let approval_date: string;
      let signer_name: string;
      let signer_position: string;

      beforeEach(async () => {
        jest
          .spyOn(ethersService as any, 'generateHDNodeWallet')
          .mockReturnValue({
            address: '0xMockedWalletAddress',
            privateKey: '0xMockedPrivateKey',
          });

        creditor_code = Math.floor(
          1000000000 + Math.random() * 9000000000,
        ).toString();

        const test_data = generateTestCreditorData();
        institution_code = test_data.institution_code;
        institution_name = test_data.institution_name;
        approval_date = test_data.approval_date;
        signer_name = test_data.signer_name;
        signer_position = test_data.signer_position;

        jest
          .spyOn(ethersService as any, 'addCreditorWithEvent')
          .mockResolvedValue({
            to: '0xMockedAddressTo',
            from: '0xMockedAddressFrom',
            hash: '0xMockedHash',
            nonce: 1,
            gasLimit: 100000,
          } as unknown as ethers.ContractTransactionResponse);

        await ethersService.addCreditorWithEvent(
          creditor_code,
          creditor_address,
          institution_code,
          institution_name,
          approval_date,
          signer_name,
          signer_position,
        );
      });

      it('should accept to purchase package', async () => {
        jest.spyOn(ethersService as any, 'purchasePackage').mockResolvedValue({
          provider: 'JsonRpcProvider {}',
          to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
          from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          contractAddress: null,
          hash: '0x4965913715b4a900565b792ff7caae5ba1f9711af9cb0858bab440abf15a5df6',
          index: 0,
          blockHash:
            '0xc9c43984b6c8f3fc56687863548f30039d90f1679efe9993b5623ace8d894793',
          blockNumber: 6,
          logsBloom:
            '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000800000000000000000000000000000000000000040000000004000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000',
          gasUsed: 75107n,
          blobGasUsed: null,
          cumulativeGasUsed: 75107n,
          gasPrice: 1460166640n,
          blobGasPrice: null,
          type: 2,
          status: 1,
          root: undefined,
        });

        const purchasePackage = await ethersService.purchasePackage(
          creditor_address,
          creditor_code,
          '2025-02-20',
          '2',
          1,
          1,
          '2025-02-20',
          '2025-02-20',
          2,
        );

        expect(purchasePackage).toBeDefined();
        expect(purchasePackage).toHaveProperty('provider');
        expect(purchasePackage).toHaveProperty('to');
        expect(purchasePackage).toHaveProperty('from');
        expect(purchasePackage).toHaveProperty('contractAddress');
        expect(purchasePackage).toHaveProperty('hash');
        expect(purchasePackage).toHaveProperty('index');
        expect(purchasePackage).toHaveProperty('blockHash');
        expect(purchasePackage).toHaveProperty('blockNumber');
        expect(purchasePackage).toHaveProperty('logsBloom');
      });
    });

    describe('Get Active Creditor By Status', () => {
      // debtor
      let nik: string;
      let debtor_name: string;
      let debtor_wallet: Wallet;
      let debtor_privateKey: string;

      //creditor
      let consumer_code: string;
      let consumer_institution_code: string;
      let consumer_institution_name: string;
      let consumer_approval_date: string;
      let consumer_signer_name: string;
      let consumer_signer_position: string;
      let consumer_wallet: Wallet;
      let consumer_privateKey: string;

      // provider
      let provider_code: string;
      let provider_institution_code: string;
      let provider_institution_name: string;
      let provider_approval_date: string;
      let provider_signer_name: string;
      let provider_signer_position: string;
      let provider_name: string;
      let provider_wallet: Wallet;
      let provider_privateKey: string;

      let application_date: string;
      let approval_date: string;
      let url_KTP: string;
      let url_approval: string;

      beforeEach(async () => {
        // spying on ethersService
        jest
          .spyOn(ethersService as any, 'generateHDNodeWallet')
          .mockReturnValue({
            address: '0xMockedWalletAddress',
            privateKey: '0xMockedPrivateKey',
          });

        jest
          .spyOn(ethersService as any, 'generateWalletWithPrivateKey')
          .mockResolvedValue({
            provider: null,
            address: '0x1234567890123456789012345678901234567890',
          });

        // add debtor
        debtor_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        debtor_wallet = (ethersService as any).generateWalletWithPrivateKey(
          debtor_privateKey,
        );

        nik = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        await ethersService.addDebtor(nik, debtor_wallet);

        // add creditor (provider)
        provider_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        provider_wallet = (ethersService as any).generateWalletWithPrivateKey(
          provider_privateKey,
        );

        provider_code = Math.floor(
          1000000000 + Math.random() * 9000000000,
        ).toString();

        const provider = generateTestCreditorData();
        provider_institution_code = provider.institution_code;
        provider_institution_name = provider.institution_name;
        provider_approval_date = provider.approval_date;
        provider_signer_name = provider.signer_name;
        provider_signer_position = provider.signer_position;
        await ethersService.addCreditorWithEvent(
          provider_code,
          provider_wallet,
          provider_institution_code,
          provider_institution_name,
          provider_approval_date,
          provider_signer_name,
          provider_signer_position,
        );

        // add creditor (consumer)
        consumer_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        consumer_wallet = (ethersService as any).generateWalletWithPrivateKey(
          consumer_privateKey,
        );

        consumer_code = Math.floor(
          1000000000 + Math.random() * 9000000000,
        ).toString();

        const consumer = generateTestCreditorData();
        consumer_institution_code = consumer.institution_code;
        consumer_institution_name = consumer.institution_name;
        consumer_approval_date = consumer.approval_date;
        consumer_signer_name = consumer.signer_name;
        consumer_signer_position = consumer.signer_position;

        provider_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        provider_wallet = (ethersService as any).generateWalletWithPrivateKey(
          provider_privateKey,
        );
        await ethersService.addCreditorWithEvent(
          consumer_code,
          consumer_wallet,
          consumer_institution_code,
          consumer_institution_name,
          consumer_approval_date,
          consumer_signer_name,
          consumer_signer_position,
        );

        // add debtor to provider
        const addDebtorToCreditor = generateTestAddDebtorToCreditorData();
        debtor_name = addDebtorToCreditor.debtor_name;
        provider_name = addDebtorToCreditor.creditor_name;
        application_date = addDebtorToCreditor.application_date;
        url_KTP = addDebtorToCreditor.url_KTP;
        url_approval = addDebtorToCreditor.url_approval;

        await ethersService.addDebtorToCreditor(
          nik,
          provider_code,
          debtor_name,
          provider_name,
          application_date,
          approval_date,
          url_KTP,
          url_approval,
        );
      }, 50000);

      it('should accept get active creditor by status', async () => {
        jest
          .spyOn(ethersService as any, 'getActiveCreditorByStatus')
          .mockResolvedValue(['0x22E71ae8f747585c646ebE6FCe7f96A7923D7F8F']);

        const data = await ethersService.getActiveCreditorByStatus(
          nik,
          StatusCreditorDelegation.APPROVED,
        );

        expect(data).toBeDefined();
        expect(data).toEqual(
          expect.arrayContaining([
            '0x22E71ae8f747585c646ebE6FCe7f96A7923D7F8F',
          ]),
        );
      });
    });
  });

  describe('Debtor Section', () => {
    describe('Add Debtor', () => {
      let nik: string;
      let debtor_privateKey: string;
      let debtor_wallet: Wallet;

      beforeEach(async () => {
        // spying method
        jest
          .spyOn(ethersService as any, 'generateHDNodeWallet')
          .mockReturnValue({
            address: '0xMockedAddress',
            privateKey: '0xMockedPrivateKey',
          });

        jest
          .spyOn(ethersService as any, 'generateWalletWithPrivateKey')
          .mockResolvedValue({
            provider: null,
            address: '0x1234567890123456789012345678901234567890',
          });

        debtor_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        debtor_wallet = (ethersService as any).generateWalletWithPrivateKey(
          debtor_privateKey,
        );
        nik = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      });
      it('should accept registration for debtor', async () => {
        jest.spyOn(ethersService as any, 'addDebtor').mockResolvedValue({
          provider: 'JsonRpcProvider {}',
          to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
          from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          contractAddress: null,
          hash: '0x4e49c2270783c958fc9b8b039841c935661fb4d7ca59ca2c4a612f92f68b518b',
          index: 0,
          blockHash:
            '0x4586155dc31c41394a310b3eb37a2af834f50e074844adbe510e215bf64839d5',
          blockNumber: 4,
        });
        const debtor: ContractTransactionResponse =
          await ethersService.addDebtor(nik, debtor_wallet);

        expect(debtor).toBeDefined();
        expect(debtor).toHaveProperty('provider');
        expect(debtor).toHaveProperty('to');
        expect(debtor).toHaveProperty('from');
        expect(debtor).toHaveProperty('contractAddress');
        expect(debtor).toHaveProperty('hash');
        expect(debtor).toHaveProperty('index');
        expect(debtor).toHaveProperty('blockHash');
        expect(debtor).toHaveProperty('blockNumber');
      });
    });

    describe('Remove Debtor', () => {
      let nik: string;
      let debtor_privateKey: string;
      let debtor_wallet: Wallet;

      beforeEach(async () => {
        // spying method
        jest
          .spyOn(ethersService as any, 'generateHDNodeWallet')
          .mockReturnValue({
            address: '0xMockedAddress',
            privateKey: '0xMockedPrivateKey',
          });

        jest
          .spyOn(ethersService as any, 'generateWalletWithPrivateKey')
          .mockResolvedValue({
            provider: null,
            address: '0x1234567890123456789012345678901234567890',
          });

        jest.spyOn(ethersService as any, 'addDebtor').mockResolvedValue({
          provider: 'JsonRpcProvider {}',
          to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
          from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          contractAddress: null,
          hash: '0x4e49c2270783c958fc9b8b039841c935661fb4d7ca59ca2c4a612f92f68b518b',
          index: 0,
          blockHash:
            '0x4586155dc31c41394a310b3eb37a2af834f50e074844adbe510e215bf64839d5',
          blockNumber: 4,
        });

        debtor_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        debtor_wallet = (ethersService as any).generateWalletWithPrivateKey(
          debtor_privateKey,
        );
        nik = Math.floor(1000000000 + Math.random() * 9000000000).toString();

        await ethersService.addDebtor(nik, debtor_wallet);
      });

      it('should accept to remove debtor', async () => {
        jest.spyOn(ethersService as any, 'removeDebtor').mockResolvedValue({
          provider: 'JsonRpcProvider {}',
          to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
          from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          contractAddress: null,
          hash: '0x4e49c2270783c958fc9b8b039841c935661fb4d7ca59ca2c4a612f92f68b518b',
          index: 0,
          blockHash:
            '0x4586155dc31c41394a310b3eb37a2af834f50e074844adbe510e215bf64839d5',
          blockNumber: 6,
        });

        const debtor: ContractTransactionReceipt =
          await ethersService.removeDebtor(nik);

        expect(debtor).toBeDefined();
        expect(debtor).toHaveProperty('provider');
        expect(debtor).toHaveProperty('to');
        expect(debtor).toHaveProperty('from');
        expect(debtor).toHaveProperty('contractAddress');
        expect(debtor).toHaveProperty('hash');
        expect(debtor).toHaveProperty('index');
        expect(debtor).toHaveProperty('blockHash');
        expect(debtor).toHaveProperty('blockNumber');
      });
    });

    describe('Get Debtor', () => {
      let nik: string;
      let debtor_privateKey: string;
      let debtor_wallet: Wallet;

      beforeEach(async () => {
        // spying method
        jest
          .spyOn(ethersService as any, 'generateHDNodeWallet')
          .mockReturnValue({
            address: '0xMockedAddress',
            privateKey: '0xMockedPrivateKey',
          });

        jest
          .spyOn(ethersService as any, 'generateWalletWithPrivateKey')
          .mockResolvedValue({
            provider: null,
            address: '0x1234567890123456789012345678901234567890',
          });

        jest.spyOn(ethersService as any, 'addDebtor').mockResolvedValue({
          provider: 'JsonRpcProvider {}',
          to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
          from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          contractAddress: null,
          hash: '0x4e49c2270783c958fc9b8b039841c935661fb4d7ca59ca2c4a612f92f68b518b',
          index: 0,
          blockHash:
            '0x4586155dc31c41394a310b3eb37a2af834f50e074844adbe510e215bf64839d5',
          blockNumber: 4,
        });

        debtor_privateKey = (ethersService as any).generateHDNodeWallet()
          .privateKey;
        debtor_wallet = (ethersService as any).generateWalletWithPrivateKey(
          debtor_privateKey,
        );
        nik = Math.floor(1000000000 + Math.random() * 9000000000).toString();

        await ethersService.addDebtor(nik, debtor_wallet);
      });

      it('should accept to get debtor data', async () => {
        jest
          .spyOn(ethersService as any, 'getDebtor')
          .mockResolvedValue('0xEf41C1211b37171Ce6A30941c6187d3135DBf952');

        const debtor = await ethersService.getDebtor(nik);

        expect(debtor).toBeDefined();
        expect(debtor).toMatch(regexPattern.walletPattern);
      });
    });

    describe('Get Log Activity', () => {
      it('should accept get log activity', async () => {
        jest.spyOn(ethersService as any, 'getLogData').mockReturnValue([
          [
            '0x2aE92A00108a1bB0C823602afc67385e1b21cD10',
            '0x22E71ae8f747585c646ebE6FCe7f96A7923D7F8F',
          ],
          [BigInt(2), BigInt(3)],
        ]);

        const data = await ethersService.getLogData('1234');
        expect(data).toBeDefined();
        expect(data).toEqual([
          [
            '0x2aE92A00108a1bB0C823602afc67385e1b21cD10',
            '0x22E71ae8f747585c646ebE6FCe7f96A7923D7F8F',
          ],
          [BigInt(2), BigInt(3)], // Ensure BigInt is correctly matched
        ]);
      });
    });
  });
});
