import { Test, TestingModule } from '@nestjs/testing';
import { VaultService } from './vault';

describe('Vault', () => {
  let provider: VaultService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VaultService],
    }).compile();

    provider = module.get<VaultService>(VaultService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
