import { Test, TestingModule } from '@nestjs/testing';
import { CreditorService } from './creditor.service';

describe('ConsumerService', () => {
  let service: CreditorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreditorService],
    }).compile();

    service = module.get<CreditorService>(CreditorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
