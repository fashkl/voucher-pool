import { ApiProperty } from '@nestjs/swagger';
import { CreateOfferDto } from './create-offer.dto';

export class OfferDto extends CreateOfferDto {
  @ApiProperty({})
  readonly id: string;

  constructor(data: OfferDto) {
    super(data);
    Object.assign(this, data);
  }
}
