import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RegistrationCustomerDTO {
  @ApiProperty({
    description: 'National Identification number.',
    example: '123...',
  })
  @IsString()
  nik: string;

  @ApiProperty({
    description: 'The email of the customer.',
    example: 'jonathanjoestar@example.com',
  })
  @IsEmail()
  email: string;
}
