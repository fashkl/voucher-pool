import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Min } from 'class-validator';
import { Customer } from '../customer/customer.entity';
import { Offer } from '../offer/offer.entity';
import { ApiProperty } from '@nestjs/swagger';
import { VoucherStatus } from './enum/voucher-status.enum';

@Entity({ name: 'vouchers' })
@Index(['code'], { unique: true })
@Index(['customer', 'code', 'offer'], { unique: true })
export class Voucher extends BaseEntity {
  @ApiProperty()
  @Min(8)
  @Column({ length: 16 }) //code of length min 8 to 16 characters - good for usability and security
  public code: string;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  public expireAt: Date;

  @ApiProperty()
  @Column({ type: 'date', nullable: true })
  public redeemedAt: Date;

  // Many Vouchers belong to One Customer
  @ManyToOne(
    () => Customer,
    customer => customer.vouchers,
  )
  @JoinColumn({ name: 'customerId' })
  public customer: Customer;

  // Many Vouchers belong to One Offer
  @ManyToOne(
    () => Offer,
    offer => offer.vouchers,
  )
  @JoinColumn({ name: 'offerId' })
  public offer: Offer;

  //getters
  get isExpired(): boolean {
    return this.expireAt < new Date();
  }

  get isRedeemed(): boolean {
    return !!this.redeemedAt;
  }

  get status(): VoucherStatus {
    if (this.isRedeemed) {
      return VoucherStatus.Redeemed;
    }
    if (this.isExpired) {
      return VoucherStatus.Expired;
    }
    return VoucherStatus.Valid;
  }
}
