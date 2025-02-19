import { Test, TestingModule } from '@nestjs/testing';
import { VaultService } from './vault';
import { BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeKey, VaultPrefix, WalletAddressType } from '../../utils/type/type';

describe('Vault', () => {
  let provider: VaultService;

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
        VAULT_API_VERSION: 'v1',
        VAULT_ADDR: 'http://127.0.0.1:8200/',
        VAULT_ROOT_TOKEN: 'mock-vault-root-token',
      };

      return configValue[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VaultService,
        { provide: Logger, useValue: mockLogger },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    provider = module.get<VaultService>(VaultService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('Store Private Key', () => {
    const mockPrivateKey = 'mock_private_key';
    const mockAddress: WalletAddressType = '0x12345';
    const mockType: TypeKey = TypeKey.CREDITOR;
    const vaultPath = `${VaultPrefix.PK_PATH}/${mockType}/${mockAddress}`;

    beforeEach(() => {
      provider['read'] = jest.fn();
      provider['createOrUpdate'] = jest.fn();
    });

    it('should store a new private key successfully', async () => {
      (provider['read'] as jest.Mock).mockResolvedValue(null);
      (provider['createOrUpdate'] as jest.Mock).mockResolvedValue(undefined);

      await provider.storePrivateKey(mockPrivateKey, mockAddress, mockType);

      expect(provider['read']).toHaveBeenCalledWith(
        VaultPrefix.VAULT,
        vaultPath,
      );
      expect(provider['createOrUpdate']).toHaveBeenCalledWith(
        VaultPrefix.VAULT,
        vaultPath,
        {
          private_key: mockPrivateKey,
          address: mockAddress,
          type: mockType,
          created_at: expect.any(String),
        },
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        `Private key for address ${mockAddress} has been successfully stored.`,
      );
    });

    it('should throw an error if the private key already exists', async () => {
      (provider['read'] as jest.Mock).mockResolvedValue({
        data: mockPrivateKey,
      });

      await expect(
        provider.storePrivateKey(mockPrivateKey, mockAddress, mockType),
      ).rejects.toThrow(
        new BadRequestException('Private key already exists for this address.'),
      );

      expect(provider['read']).toHaveBeenCalledWith(
        VaultPrefix.VAULT,
        vaultPath,
      );
      expect(provider['createOrUpdate']).not.toHaveBeenCalled();
    });
  });
  describe('Read Private Key', () => {
    const mockPrivateKey = 'mock_private_key';
    const mockAddress: WalletAddressType = '0x12345';
    const mockType: TypeKey = TypeKey.CREDITOR;
    const vaultPath = `${VaultPrefix.PK_PATH}/${mockType}/${mockAddress}`;

    beforeEach(() => {
      provider['read'] = jest.fn();
    });

    it('should return the private key if found', async () => {
      (provider['read'] as jest.Mock).mockResolvedValue({
        private_key: mockPrivateKey,
      });

      const result = await provider.readPrivateKey(mockAddress, mockType);

      expect(result).toBe(mockPrivateKey);
      expect(provider['read']).toHaveBeenCalledWith(
        VaultPrefix.VAULT,
        vaultPath,
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        `Private key retrieved for address ${mockAddress}`,
      );
    });

    it('should throw an error if the private key is not found', async () => {
      (provider['read'] as jest.Mock).mockResolvedValue(null);

      await expect(
        provider.readPrivateKey(mockAddress, mockType),
      ).rejects.toThrow(
        new BadRequestException(
          `Private key not found for address ${mockAddress}`,
        ),
      );

      expect(provider['read']).toHaveBeenCalledWith(
        VaultPrefix.VAULT,
        vaultPath,
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Error reading private key for address ${mockAddress}: Private key not found for address ${mockAddress}`,
      );
    });
  });
});
