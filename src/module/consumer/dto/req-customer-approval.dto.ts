import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ReqCustomerApprovalDTO {
  @ApiProperty({
    description: 'The email of the customer.',
    example: 'jonathanjoestar@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'National Identification number.',
    example: '123...',
  })
  @IsString()
  nik: string;
}
