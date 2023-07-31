import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Voucher } from './voucher.entity';
import { EntityManager, Repository } from 'typeorm';
import { CustomerService } from '../customer/customer.service';
import { OfferService } from '../offer/offer.service';
import { GenerateVoucherDto } from './dto/generate-voucher.dto';
import { ValidateVoucherDto } from './dto/validate-voucher.dto';
import { VoucherStatus } from './enum/voucher-status.enum';
import { ApiException } from '../shared/api.exception';
import { ValidVoucherCodeDto } from './dto/valid-voucher-code.dto';
import { VoucherErrors } from './enum/voucher-errors.enum';
import { CustomerErrors } from '../customer/enum/customer-errors.enum';
import { Customer } from '../customer/customer.entity';
import { generateRandomText, getRandomNumber } from '../shared/utils';
import { Offer } from '../offer/offer.entity';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
    private customerService: CustomerService,
    private offerService: OfferService,
    private entityManager: EntityManager
  ) {
  }

  async generateVouchers(
    generateVoucherDto: GenerateVoucherDto
  ): Promise<number> {
    const { offerId, expireAt } = generateVoucherDto;

    const offer = await this.offerService.getOfferById(offerId);

    const customers = await this.customerService.getCustomers();
    if (!customers.length) return 0;

    const tasks = [];
    const batchSize = 100;

    for (let i = 0; i < customers.length; i += batchSize) {
      const batchCustomers = customers.slice(i, i + batchSize);
      tasks.push(this.generateVouchersForBatch(batchCustomers, offer, expireAt));
    }

    //run tasks concurrently
    await Promise.allSettled(tasks);

    return customers.length;
  }

  async generateVouchersForBatch(customers: Customer[], offer: Offer, expireAt: Date): Promise<void> {
    await this.entityManager.transaction(async transactionalEntityManager => {

      const vouchers = customers.map((customer) => {
        const codeLength = getRandomNumber(8, 16);
        const code = this.generateVoucherCode(codeLength);
        return this.voucherRepository.create({
          code,
          customer,
          offer,
          expireAt: new Date(expireAt)
        });
      });

      await transactionalEntityManager.save(vouchers);

    });
  }

  async validateVoucherCode(
    validateVoucherDto: ValidateVoucherDto
  ): Promise<number> {
    const { code, email } = validateVoucherDto;

    const voucher = await this.getVoucherByCode(code);

    this.validateVoucherExistence(voucher);

    this.validateVoucherEmail(voucher, email);

    this.validateVoucherStatus(voucher);

    voucher.redeemedAt = new Date();
    await this.voucherRepository.save(voucher);

    return voucher?.offer?.discountPercentage;
  }

  async getValidVouchersByEmail(email: string): Promise<ValidVoucherCodeDto[]> {
    const customer = await this.customerService.getCustomerByEmail(email);
    if (!customer) {
      throw new ApiException(
        CustomerErrors.CustomerNotFound,
        'Customer with provided email not found'
      );
    }

    const vouchers = await this.getValidVouchersForCustomer(customer);
    if (!vouchers?.length) return [];

    return vouchers.map(voucher => {
      const offerName = voucher.offer ? voucher.offer.name : '';
      return new ValidVoucherCodeDto({ code: voucher.code, offerName });
    });
  }

  async getValidVouchersForCustomer(customer: Customer): Promise<Voucher[]> {
    return this.voucherRepository
      .createQueryBuilder('voucher')
      .leftJoinAndSelect('voucher.offer', 'offer')
      .where('voucher.customer = :customerId', { customerId: customer.id })
      .andWhere('voucher.redeemedAt IS NULL')
      .andWhere('voucher.expireAt > :currentDate', { currentDate: new Date() })
      .getMany();
  }

  async getVoucherByCode(code: string): Promise<Voucher | undefined> {
    return this.voucherRepository.findOne({
      where: { code },
      relations: ['customer', 'offer']
    });
  }


  //Helper functions
  private generateVoucherCode(length: number): string {
    return generateRandomText(length);
  }

  private validateVoucherExistence(voucher: Voucher | undefined): void {
    if (!voucher) {
      throw new ApiException(VoucherErrors.VoucherNotFound, 'Voucher not found');
    }
  }

  private validateVoucherEmail(voucher: Voucher | undefined, email: string): void {
    if (email !== voucher?.customer?.email) {
      throw new ApiException(
        VoucherErrors.VoucherInvalidForProvidedEmail,
        'Voucher is not for the provided email'
      );
    }
  }

  private validateVoucherStatus(voucher: Voucher | undefined): void {
    const { status } = voucher;
    if (status !== VoucherStatus.Valid) {
      throw new ApiException(
        VoucherErrors.VoucherInvalid,
        `Voucher is not valid, already ${status}`
      );
    }
  }


}
