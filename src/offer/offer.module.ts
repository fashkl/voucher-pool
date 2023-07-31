import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './offer.entity';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [TypeOrmModule.forFeature([Offer]), ThrottlerModule.forRoot()],
  providers: [OfferService],
  exports: [OfferService],
  controllers: [OfferController],
})
export class OfferModule {}
