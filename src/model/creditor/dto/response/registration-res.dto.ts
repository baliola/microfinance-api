import { ApiProperty } from '@nestjs/swagger';

export class RegistrationCreditorResponseDTO {
  @ApiProperty({
    description: 'Unique wallet address.',
    example: '0x...',
  })
  wallet_address: `0x${string}`;
}
