import { IsString } from 'class-validator';

export class StatusCustomerApprovalDTO {
  @IsString()
  nik: string;
}
