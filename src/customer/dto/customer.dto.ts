import { CreateCustomerDto } from './create-customer.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CustomerDto extends CreateCustomerDto {
  @ApiProperty({})
  readonly id: string;

  constructor(data: CustomerDto) {
    super(data);
    Object.assign(this, data);
  }
}
