import { Test, TestingModule } from '@nestjs/testing';
import { DebtorController } from './debtor.controller';

describe('DebtorController', () => {
  let controller: DebtorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DebtorController],
    }).compile();

    controller = module.get<DebtorController>(DebtorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
