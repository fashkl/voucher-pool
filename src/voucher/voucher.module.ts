import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from './voucher.entity';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';
import { CustomerModule } from '../customer/customer.module';
import { OfferModule } from '../offer/offer.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    TypeOrmModule.forFeature([Voucher]),
    ThrottlerModule.forRoot(),
    CustomerModule,
    OfferModule
  ],
  providers: [VoucherService],
  exports: [VoucherService],
  controllers: [VoucherController],
})
export class VoucherModule {
}