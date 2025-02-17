import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';
import { TransactionCommonType } from 'src/utils/type/type';

export class GetActiveCreditorByStatusDTO {
  @ApiProperty({
    description: 'National Identification number from Customer.',
    required: true,
    example: '123...',
  })
  @IsString()
  debtor_nik: string;

  @ApiProperty({
    description: 'Status of Active Creditor.',
    required: true,
    example: 'PENDING',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
  })
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'], {
    message: 'status must be one of: PENDING, APPROVED, REJECTED',
  })
  @IsString()
  status: TransactionCommonType;
}
