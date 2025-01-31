import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegistrationCreditorDTO {
  @ApiProperty({
    description: 'Creditor Code.',
    example: '123...',
  })
  @IsString()
  creditor_code: string;
}
