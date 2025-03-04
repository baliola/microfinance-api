import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class RegistrationCreditorDTO {
  @ApiProperty({
    description: 'Unique Code of Creditor.',
    example: '123...',
  })
  @IsString()
  @IsNotEmpty()
  creditor_code: string;

  @ApiProperty({
    description: 'Unique Code of Institution.',
    example: '...',
  })
  @IsString()
  @IsOptional()
  institution_code: string;

  @ApiProperty({
    description: 'Name of Institution.',
    example: '...',
  })
  @IsString()
  @IsOptional()
  institution_name: string;

  @ApiProperty({
    description: 'Date of the Approval.',
    example: '...',
  })
  @IsDateString()
  @IsOptional()
  approval_date: string;

  @ApiProperty({
    description: 'Name of the Signer.',
    example: '...',
  })
  @IsString()
  @IsOptional()
  signer_name: string;

  @ApiProperty({
    description: 'Position of the Signer.',
    example: '...',
  })
  @IsString()
  @IsOptional()
  signer_position: string;
}
