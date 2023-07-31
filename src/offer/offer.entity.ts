import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Voucher } from '../voucher/voucher.entity';

@Entity({ name: 'offers' })
export class Offer extends BaseEntity {
  @Column()
  public name: string;

  @Column({ type: 'float' })
  public discountPercentage: number;

  // One Offer has Many Vouchers
  @OneToMany(
    () => Voucher,
    voucher => voucher.offer,
  )
  vouchers: Voucher[];
}
