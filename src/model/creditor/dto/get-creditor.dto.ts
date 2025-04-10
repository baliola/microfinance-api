import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetCreditorDTO {
  @ApiProperty({
    description: 'Creditor Unique Code.',
    example: '123',
  })
  @IsString()
  creditor_code: string;
}
