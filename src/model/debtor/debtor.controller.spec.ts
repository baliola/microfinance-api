import { Test, TestingModule } from '@nestjs/testing';
import { DebtorController } from './debtor.controller';
import { DebtorService } from './debtor.service';
import { Logger } from '@nestjs/common';
import { LogActivityDTO } from './dto/log-activity.dto';
import { WrapperResponseDTO } from '../../common/helper/response';
import { RegistrationDebtorDTO } from './dto/registration.dto';

describe('DebtorController', () => {
  let controller: DebtorController;

  const mockDebtorService = {
    getLogActivity: jest.fn(),
    registration: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DebtorController],
      providers: [
        { provide: DebtorService, useValue: mockDebtorService },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    controller = module.get<DebtorController>(DebtorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Log Activity', () => {
    it('should request debtor log activity and return response', async () => {
      const dto: LogActivityDTO = {
        nik: '12345',
      };

      mockDebtorService.getLogActivity.mockResolvedValue(undefined);

      const result = await controller.logActivity(dto);

      expect(mockDebtorService.getLogActivity).toHaveBeenCalledWith(dto.nik);
      expect(result).toBeInstanceOf(WrapperResponseDTO);
      expect(result.message).toBe('Success');
    });
  });

  describe('Registration', () => {
    it('should request debtor registration and return response', async () => {
      const dto: RegistrationDebtorDTO = {
        nik: '12345',
      };

      mockDebtorService.registration.mockResolvedValue(undefined);

      const result = await controller.registration(dto);

      expect(mockDebtorService.registration).toHaveBeenCalledWith(dto.nik);
      expect(result).toBeInstanceOf(WrapperResponseDTO);
      expect(result.message).toBe('Registration success.');
    });
  });
});
