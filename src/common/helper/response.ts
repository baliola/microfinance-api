import { ApiProperty } from '@nestjs/swagger';

export class WrapperResponseDTO<T> {
  @ApiProperty({
    description: 'Response data containing the main payload.',
    type: Object,
    isArray: true,
    nullable: true,
  })
  data?: T | null;

  @ApiProperty({
    description: 'Additional information or message about the response.',
    example: '',
  })
  message: string;

  constructor(data: T, message: string) {
    this.data = data;
    this.message = message;
  }
}
