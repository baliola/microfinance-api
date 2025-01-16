import { IsEmail, IsString } from 'class-validator';

export class ReqCustomerApprovalDTO {
  @IsEmail()
  email: string;

  @IsString()
  nik: string;
}
