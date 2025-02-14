import { Test, TestingModule } from '@nestjs/testing';
import { EthersService } from './ethers';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, Wallet } from 'ethers';
import {
  generateTestAddDebtorToCreditorData,
  generateTestCreditorData,
} from '../../utils/test/creditor-test';
import { regexPattern } from '../../utils/type/regex.type';

let providerMock = {
  getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
  getBlockNumber: jest.fn().mockResolvedValue(123456),
} as unknown as jest.Mocked<ethers.JsonRpcProvider>;

jest.mock('ethers', () => {
  const actualEthers = jest.requireActual('ethers');
  return {
    ...actualEthers,
    providers: {
      JsonRpcProvider: jest.fn().mockImplementation(() => providerMock),
    },
  };
});

describe('EthersService', () => {
  let ethersService: EthersService;
  providerMock = new ethers.JsonRpcProvider() as any;

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
        RPC_URL: 'http://127.0.0.1:8545/',
        PRIVATE_KEY:
          '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        CONTRACT_ADDRESS: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
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
  });

  it('should be defined', () => {
    expect(ethersService).toBeDefined();
  });

  it('should generate wallet', () => {
    jest.spyOn(ethersService as any, 'generateWallet');
    const wallet = (ethersService as any).generateWallet();
    expect(wallet).toHaveProperty('address');
    expect(wallet).toHaveProperty('privateKey');
  });

  it('should generate wallet with private key', () => {
    jest.spyOn(ethersService as any, 'generateWallet');
    const wallet = (ethersService as any).generateWallet();

    // test for generate wallet using private key
    jest.spyOn(ethersService as any, 'generateWalletWithPrivateKey');
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
      let creditor_address: `0x${string}`;
      let creditor_code: string;

      beforeEach(async () => {
        jest.spyOn(ethersService as any, 'generateWallet');
        creditor_address = (ethersService as any).generateWallet().address;

        creditor_code = Math.floor(
          1000000000 + Math.random() * 9000000000,
        ).toString();
      });
      it('should accept add creditor', async () => {
        const creditor = await ethersService.addCreditor(
          creditor_code,
          creditor_address,
        );

        expect(creditor).toBeDefined();
        expect(creditor).toHaveProperty('provider');
        expect(creditor).toHaveProperty('to');
        expect(creditor).toHaveProperty('from');
        expect(creditor).toHaveProperty('contractAddress');
        expect(creditor).toHaveProperty('hash');
      });
    });

    describe('Add Creditor With Event', () => {
      let creditor_address: `0x${string}`;
      let creditor_code: string;
      let institution_code: string;
      let institution_name: string;
      let approval_date: string;
      let signer_name: string;
      let signer_position: string;

      beforeEach(async () => {
        jest.spyOn(ethersService as any, 'generateWallet');
        creditor_address = (ethersService as any).generateWallet().address;

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
        const creditor = await ethersService.addCreditorWithEvent(
          creditor_code,
          creditor_address,
          institution_code,
          institution_name,
          approval_date,
          signer_name,
          signer_position,
        );

        expect(creditor).toBeDefined();
        expect(creditor).toHaveProperty('provider');
        expect(creditor).toHaveProperty('to');
        expect(creditor).toHaveProperty('from');
        expect(creditor).toHaveProperty('contractAddress');
        expect(creditor).toHaveProperty('hash');
      });
    });

    describe('Remove Creditor', () => {
      let creditor_address: `0x${string}`;
      let creditor_code: string;
      let institution_code: string;
      let institution_name: string;
      let approval_date: string;
      let signer_name: string;
      let signer_position: string;

      beforeAll(async () => {
        jest.spyOn(ethersService as any, 'generateWallet');
        creditor_address = (ethersService as any).generateWallet().address;

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
        const creditor = await ethersService.removeCreditor(creditor_code);
        expect(creditor).toBeDefined();
        expect(creditor).toHaveProperty('provider');
        expect(creditor).toHaveProperty('to');
        expect(creditor).toHaveProperty('from');
        expect(creditor).toHaveProperty('contractAddress');
        expect(creditor).toHaveProperty('hash');
      });
    });

    describe('Get Creditor', () => {
      let creditor_address: `0x${string}`;
      let creditor_code: string;
      let institution_code: string;
      let institution_name: string;
      let approval_date: string;
      let signer_name: string;
      let signer_position: string;

      beforeAll(async () => {
        if (!ethersService) {
          throw new Error('ethersService is not defined');
        }
        if (typeof ethersService.generateWallet !== 'function') {
          throw new Error('ethersService.generateWallet is not a function');
        }

        jest.spyOn(ethersService as any, 'generateWallet');
        creditor_address = (ethersService as any).generateWallet().address;

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

      it('should accept get creditor', async () => {
        const creditor = await ethersService.getCreditor(creditor_code);
        expect(creditor).toBeDefined();
        expect(creditor).toMatch(regexPattern.walletPattern);
      });
    });

    describe('Add Debtor to Creditor', () => {
      // creditor
      let creditor_address: `0x${string}`;
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
      let debtor_address: `0x${string}`;

      beforeAll(async () => {
        jest.spyOn(ethersService as any, 'generateWallet');
        debtor_address = (ethersService as any).generateWallet().address;

        debtor_nik = Math.floor(
          1000000000 + Math.random() * 9000000000,
        ).toString();
        await ethersService.addDebtor(debtor_nik, debtor_address);

        if (!ethersService) {
          throw new Error('ethersService is not defined');
        }
        if (typeof ethersService.generateWallet !== 'function') {
          throw new Error('ethersService.generateWallet is not a function');
        }

        jest.spyOn(ethersService as any, 'generateWallet');
        creditor_address = (ethersService as any).generateWallet().address;

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

        const addDebtorToCreditor = generateTestAddDebtorToCreditorData();
        creditor_name = institution_name;
        debtor_name = addDebtorToCreditor.debtor_name;
        application_date = addDebtorToCreditor.application_date;
        url_KTP = addDebtorToCreditor.url_KTP;
        url_approval = addDebtorToCreditor.url_approval;
      }, 50000);

      it('should accept add debtor to creditor', async () => {
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
        expect(data).toHaveProperty('provider');
        expect(data).toHaveProperty('to');
        expect(data).toHaveProperty('from');
        expect(data).toHaveProperty('contractAddress');
        expect(data).toHaveProperty('hash');
      }, 50000);
    });

    describe('Request Delegation', () => {
      // debtor
      let nik: string;
      let debtor_address: `0x${string}`;
      let debtor_name: string;

      //creditor
      let consumer_address: `0x${string}`;
      let consumer_code: string;
      let consumer_institution_code: string;
      let consumer_institution_name: string;
      let consumer_approval_date: string;
      let consumer_signer_name: string;
      let consumer_signer_position: string;
      let consumer_wallet: Wallet;

      let provider_address: `0x${string}`;
      let provider_code: string;
      let provider_institution_code: string;
      let provider_institution_name: string;
      let provider_approval_date: string;
      let provider_signer_name: string;
      let provider_signer_position: string;
      let provider_name: string;

      let application_date: string;
      let approval_date: string;
      let url_KTP: string;
      let url_approval: string;

      beforeAll(async () => {
        // add debtor
        jest.spyOn(ethersService as any, 'generateWallet');
        debtor_address = (ethersService as any).generateWallet().address;

        nik = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        await ethersService.addDebtor(nik, debtor_address);

        // add creditor (provider)
        jest.spyOn(ethersService as any, 'generateWallet');
        provider_address = (ethersService as any).generateWallet().address;

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
          provider_address,
          provider_institution_code,
          provider_institution_name,
          provider_approval_date,
          provider_signer_name,
          provider_signer_position,
        );

        // add creditor (consumer)
        jest.spyOn(ethersService as any, 'generateWallet');
        consumer_wallet = (ethersService as any).generateWallet();
        consumer_address = consumer_wallet.address as `0x${string}`;

        consumer_code = Math.floor(
          1000000000 + Math.random() * 9000000000,
        ).toString();

        const consumer = generateTestCreditorData();
        consumer_institution_code = consumer.institution_code;
        consumer_institution_name = consumer.institution_name;
        consumer_approval_date = consumer.approval_date;
        consumer_signer_name = consumer.signer_name;
        consumer_signer_position = consumer.signer_position;
        await ethersService.addCreditorWithEvent(
          consumer_code,
          consumer_address,
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

        console.log('consumer_address: ', consumer_address);
        console.log('nik: ', nik);
        console.log('consumer_code: ', consumer_code);
        console.log('provider_code: ', provider_code);
      }, 50000);

      it('should accept request delegation', async () => {
        try {
          const data = await ethersService.requestDelegation(
            consumer_wallet,
            nik,
            consumer_code,
            provider_code,
          );

          console.log('data: ', data);
        } catch (error) {
          console.log(error);
        }
      }, 50000);
    });
  });

  describe('Debtor Section', () => {
    describe('Add Debtor', () => {
      let nik: string;
      let debtor_address: `0x${string}`;

      beforeEach(async () => {
        jest.spyOn(ethersService as any, 'generateWallet');
        debtor_address = (ethersService as any).generateWallet().address;

        nik = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      });

      it('should accept add debtor', async () => {
        const debtor = await ethersService.addDebtor(nik, debtor_address);

        expect(debtor).toBeDefined();
        expect(debtor).toHaveProperty('provider');
        expect(debtor).toHaveProperty('to');
        expect(debtor).toHaveProperty('from');
        expect(debtor).toHaveProperty('contractAddress');
        expect(debtor).toHaveProperty('hash');
      });
    });

    describe('Remove Debtor', () => {
      let nik: string;
      let debtor_address: `0x${string}`;

      beforeAll(async () => {
        jest.spyOn(ethersService as any, 'generateWallet');
        debtor_address = (ethersService as any).generateWallet().address;

        nik = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        await ethersService.addDebtor(nik, debtor_address);
      });

      it('should accept remove debtor', async () => {
        const debtor = await ethersService.removeDebtor(nik);

        expect(debtor).toBeDefined();
        expect(debtor).toHaveProperty('provider');
        expect(debtor).toHaveProperty('to');
        expect(debtor).toHaveProperty('from');
        expect(debtor).toHaveProperty('contractAddress');
        expect(debtor).toHaveProperty('hash');
      });
    });
  });
});
