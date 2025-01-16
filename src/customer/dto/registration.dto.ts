import { IsEmail, IsString } from 'class-validator';

export class RegistrationCustomerDTO {
  @IsString()
  nik: string;

  @IsEmail()
  email: string;
}
