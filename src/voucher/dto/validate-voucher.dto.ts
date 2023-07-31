import {
  IsNotEmpty,
  IsEmail,
  IsAscii,
  MinLength,
  MaxLength
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CustomerErrors } from '../../customer/enum/customer-errors.enum';

export class ValidateVoucherDto {
  @ApiProperty()
  @MinLength(8)
  @MaxLength(16)
  @IsNotEmpty()
  readonly code: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(email => String(email).toLowerCase())
  @IsAscii()
  @IsEmail({}, { message: CustomerErrors.EmailInvalid })
  readonly email: string;

  constructor(data: ValidateVoucherDto) {
    Object.assign(this, data);
  }
}
