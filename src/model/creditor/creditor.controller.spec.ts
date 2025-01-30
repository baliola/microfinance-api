import { Test, TestingModule } from '@nestjs/testing';
import { CreditorController } from './creditor.controller';
import { CreditorService } from './creditor.service';
import { Logger } from '@nestjs/common';
import { ReqCreditorDelegationDTO } from './dto/req-delegation.dto';
import { WrapperResponseDTO } from '../../common/helper/response';
import { StatusCreditorDelegationDTO } from './dto/status-delegation.dto';
import { DelegationApprovalDTO } from './dto/delegation-approval.dto';

describe('CreditorController', () => {
  let controller: CreditorController;
  const mockCreditorService = {
    registration: jest.fn(),
    delegationApproval: jest.fn(),
    getStatusCreditorDelegation: jest.fn(),
    createDelegation: jest.fn(),
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
      controllers: [CreditorController],
      providers: [
        {
          provide: CreditorService,
          useValue: mockCreditorService,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    controller = module.get<CreditorController>(CreditorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('ReqCreditorDelegation', () => {
    it('should request creditor approval and return response', async () => {
      const dto: ReqCreditorDelegationDTO = {
        nik: '12345',
        creditor_wallet_address: '0xabc123',
      };

      mockCreditorService.createDelegation.mockResolvedValue(undefined);

      const result = await controller.reqCreditorDelegation(dto);

      expect(mockCreditorService.createDelegation).toHaveBeenCalledWith(
        dto.nik,
        dto.creditor_wallet_address,
      );
      expect(result).toBeInstanceOf(WrapperResponseDTO);
      expect(result.message).toBe('Delegation request to creditor sent.');
    });
  });

  describe('statusCreditorDelegation', () => {
    it('should return the status of the delegation', async () => {
      const dto: StatusCreditorDelegationDTO = {
        nik: '12345',
        creditor_wallet_address: '0xabc123',
      };

      mockCreditorService.getStatusCreditorDelegation.mockResolvedValue(
        undefined,
      );

      const result = await controller.statusCreditorDelegation(dto);

      expect(
        mockCreditorService.getStatusCreditorDelegation,
      ).toHaveBeenCalledWith(dto.nik, dto.creditor_wallet_address);
      expect(result).toBeInstanceOf(WrapperResponseDTO);
    });
  });

  describe('delegationApproval', () => {
    it('should approve or reject delegation request', async () => {
      const dto: DelegationApprovalDTO = {
        nik: '12345',
        is_approve: true,
        creditor_walet_address: '0xabc123',
      };

      mockCreditorService.delegationApproval.mockResolvedValue(undefined);

      const result = await controller.delegationApproval(dto);

      expect(mockCreditorService.delegationApproval).toHaveBeenCalledWith(
        dto.nik,
        dto.is_approve,
        dto.creditor_walet_address,
      );
      expect(result).toBeInstanceOf(WrapperResponseDTO);
    });
  });

  describe('registration', () => {
    it('should register a creditor and return success response', async () => {
      mockCreditorService.registration.mockResolvedValue(undefined);

      const result = await controller.registration();

      expect(mockCreditorService.registration).toHaveBeenCalled();
      expect(result).toBeInstanceOf(WrapperResponseDTO);
      expect(result.message).toBe('Creditor registration success.');
    });
  });
});
