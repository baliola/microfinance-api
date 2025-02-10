import { Test, TestingModule } from '@nestjs/testing';
import { EthersService } from './ethers';

describe('Ethers', () => {
  let provider: EthersService;
  const mockEtherService = {
    generateWallet: jest.fn(),
    getEIP712Domain: jest.fn(),
    signMetaTransaction: jest.fn(),
    executeMetaTransaction: jest.fn(),
    addCreditor: jest.fn(),
    addCreditorWithEvent: jest.fn(),
    addDebtor: jest.fn(),
    removeCreditor: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EthersService],
    }).compile();

    provider = module.get<EthersService>(EthersService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
