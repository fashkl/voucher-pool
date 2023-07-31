import { ApiProperty } from '@nestjs/swagger';

export class ValidVoucherCodeDto {
  @ApiProperty()
  readonly code: string;

  @ApiProperty()
  readonly offerName: string;

  constructor(props: ValidVoucherCodeDto) {
    Object.assign(this, props);
  }

}
