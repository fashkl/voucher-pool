import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Voucher } from '../voucher/voucher.entity';

@Index(['email'], { unique: true })
@Entity({ name: 'customers' })
export class Customer extends BaseEntity {
  @Column()
  public name: string;

  @Column()
  public email: string;

  // One Customer has Many unique Vouchers
  @OneToMany(
    () => Voucher,
    voucher => voucher.customer
  )
  vouchers: Voucher[];
}
