import { IsNotEmpty, IsNumber, IsString, Max, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CustomerErrors } from '../../customer/enum/customer-errors.enum';

export class CreateOfferDto {
  @ApiProperty({})
  @IsNotEmpty()
  @IsString({ message: CustomerErrors.NameInvalid })
  @MinLength(3)
  readonly name: string;

  @ApiProperty({})
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100)
  readonly discountPercentage: number;

  constructor(data: CreateOfferDto) {
    Object.assign(this, data);
  }
}
