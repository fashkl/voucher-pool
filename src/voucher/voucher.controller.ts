import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor, UsePipes, ValidationPipe
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { Voucher } from './voucher.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GenerateVoucherDto } from './dto/generate-voucher.dto';
import { ValidateVoucherDto } from './dto/validate-voucher.dto';
import { ValidVoucherCodeDto } from './dto/valid-voucher-code.dto';
import { ApiErrorHelper } from '../shared/api-error.helper';
import { ValidationErrorHelper } from '../shared/validation-error.helper';
import { OfferErrors } from '../offer/enum/offer-errors.enum';
import { CustomerErrors } from '../customer/enum/customer-errors.enum';
import { VoucherErrors } from './enum/voucher-errors.enum';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('v1/voucher')
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(ThrottlerGuard)
@ApiTags('Voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}


  @Post('generate')
  @Throttle(10, 60)
  @ApiOperation({ summary: 'Generate a voucher code for a customer and offer' })
  @ApiResponse({
    status: 201,
    description: 'Customers have successfully got new voucher.',
    type: Number,
  })
  @ApiResponse(
    ApiErrorHelper([
      OfferErrors.OfferNotFound,
      CustomerErrors.CustomerNotFound,
      VoucherErrors.VoucherNotFound,
      VoucherErrors.VoucherInvalidForProvidedEmail,
    ]),
  )
  @ApiResponse(
    ValidationErrorHelper([
      OfferErrors.OfferIdInvalid,
      CustomerErrors.CustomerIdInvalid,
      VoucherErrors.VoucherInvalid,
      VoucherErrors.VoucherInvalidForProvidedEmail,
    ]),
  )
  async generateVoucher(
    @Body() generateVoucherDto: GenerateVoucherDto,
  ): Promise<number> {
    return this.voucherService.generateVouchers(generateVoucherDto);
  }

  @Post('validate')
  @Throttle(10, 60)
  @ApiOperation({ summary: 'Validate & redeem a voucher code for a customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer redeemed voucher',
    type: Number,
  })
  @ApiResponse(
    ApiErrorHelper([
      VoucherErrors.VoucherNotFound,
      VoucherErrors.VoucherInvalid,
    ]),
  )
  @ApiResponse(
    ValidationErrorHelper([
      VoucherErrors.VoucherInvalidForProvidedEmail,
    ]),
  )
  async validateVoucher(
    @Body() validateVoucherDto: ValidateVoucherDto,
  ): Promise<number> {
    return this.voucherService.validateVoucherCode(validateVoucherDto);
  }

  @Get('valid')
  @Throttle(10, 60)
  @ApiOperation({ summary: 'List of valid vouchers codes for customer' })
  @ApiResponse({
    status: 200,
    description: 'Customer valid codes',
    type: ValidVoucherCodeDto,
  })
  @ApiResponse(
    ApiErrorHelper([
      CustomerErrors.CustomerNotFound,
    ]),
  )
  async getValidVouchersByEmail(
    @Query('email') email: string,
  ): Promise<ValidVoucherCodeDto[]> {
    return this.voucherService.getValidVouchersByEmail(email);
  }
}
