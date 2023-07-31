import { ApiProperty } from '@nestjs/swagger';
import { IsAscii, IsEmail, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { CustomerErrors } from '../enum/customer-errors.enum';

export class CreateCustomerDto {
  @ApiProperty({})
  @IsString({ message: CustomerErrors.NameInvalid })
  @MinLength(3)
  readonly name: string;

  @ApiProperty({})
  // @Transform(email => String(email).toLowerCase())
  // // @IsAscii()
  // @IsEmail({}, { message: CustomerErrors.EmailInvalid })
  readonly email: string;

  constructor(data: CreateCustomerDto) {
    Object.assign(this, data);
  }
}
