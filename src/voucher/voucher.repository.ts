import { EntityRepository, Repository } from 'typeorm';
import { Voucher } from './voucher.entity';

@EntityRepository(Voucher)
export class VoucherRepository extends Repository<Voucher> {}
