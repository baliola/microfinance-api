import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDTO {
  @ApiProperty({ example: null })
  data: null;

  @ApiProperty({
    oneOf: [
      { type: 'string', example: 'Debtor already exists.' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['debtor_nik must be a string'],
      },
    ],
    description: 'Error message or validation errors',
  })
  message: string | string[];

  @ApiProperty({
    example: new Date().toISOString(),
    description: 'Timestamp when the error occurred',
  })
  timestamp: string;
}
