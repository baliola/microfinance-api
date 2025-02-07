import { Test, TestingModule } from '@nestjs/testing';
import { EthersService } from './ethers';

describe('Ethers', () => {
  let provider: EthersService;

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
