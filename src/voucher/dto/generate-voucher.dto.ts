import { IsNotEmpty, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsAfterCurrentDate } from '../../shared/custom-validators-decorators';


const currentDate = new Date();
const nextDay = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

export class GenerateVoucherDto {

  @ApiProperty({ format: 'uuid' })
  @IsNotEmpty()
  @IsUUID(4)
  readonly offerId: string;

  @ApiProperty({ default: nextDay.toISOString()})
  @IsAfterCurrentDate()
  @IsDateString()
  readonly expireAt: Date;
}
