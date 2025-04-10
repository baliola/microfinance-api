import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RemoveCreditorDTO {
  @ApiProperty({
    description: 'Unique Code of Creditor.',
    example: '123',
  })
  @IsString()
  creditor_code: string;
}
