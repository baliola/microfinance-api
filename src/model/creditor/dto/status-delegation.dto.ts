import { IsString } from 'class-validator';

export class StatusCreditorDelegationDTO {
  @IsString()
  nik: string;

  @IsString()
  creditor_code: string;
}
