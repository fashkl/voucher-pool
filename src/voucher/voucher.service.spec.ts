import { Test, TestingModule } from '@nestjs/testing';
import { GenerateVoucherDto } from './dto/generate-voucher.dto';
import { OfferService } from '../offer/offer.service';
import { CustomerService } from '../customer/customer.service';
import { VoucherService } from './voucher.service';
import { Offer } from '../offer/offer.entity';
import { Customer } from '../customer/customer.entity';
import { v4 as uuid } from 'uuid';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Voucher } from './voucher.entity';
import { ValidateVoucherDto } from './dto/validate-voucher.dto';
import { ApiException } from '../shared/api.exception';
import { VoucherErrors } from './enum/voucher-errors.enum';
import { ValidVoucherCodeDto } from './dto/valid-voucher-code.dto';
import { CustomerErrors } from '../customer/enum/customer-errors.enum';


describe('VoucherService', () => {
  let voucherService: VoucherService;
  let offerService: OfferService;
  let customerService: CustomerService;
  let entityManager: EntityManager;
  let voucherRepository: Repository<Voucher>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        VoucherService,
        {
          provide: OfferService,
          useFactory: () => ({
            getOfferById: jest.fn()
          })
        },
        {
          provide: CustomerService,
          useFactory: () => ({
            getCustomers: jest.fn(),
            getCustomerByEmail: jest.fn()
          })
        },
        {
          provide: getRepositoryToken(Voucher),
          useFactory: () => ({
            findOne: jest.fn(),
            save: jest.fn()
          })
        },
        EntityManager
      ]
    }).compile();

    voucherService = moduleRef.get<VoucherService>(VoucherService);
    offerService = moduleRef.get<OfferService>(OfferService);
    customerService = moduleRef.get<CustomerService>(CustomerService);
    entityManager = moduleRef.get<EntityManager>(EntityManager);
    voucherRepository = moduleRef.get<Repository<Voucher>>(getRepositoryToken(Voucher));
  });


  describe('generateVoucher', () => {
    const offerId = uuid();
    const generateVoucherDto: GenerateVoucherDto = {
      offerId,
      expireAt: new Date('2023-12-31')
    };

    it('should return 0 if no customers are found', async () => {
      jest.spyOn(customerService, 'getCustomers').mockResolvedValue([]);

      const result = await voucherService.generateVouchers(generateVoucherDto);

      expect(result).toBe(0);
      expect(customerService.getCustomers).toHaveBeenCalledTimes(1);
    });

    it('should call generateVouchersForBatch for each batch of customers', async () => {
      const offer: Offer = {
        id: offerId,
        name: 'Discount Offer',
        discountPercentage: 10
      } as Offer;

      const customers: Customer[] = [
        { id: uuid(), name: 'Customer 1', email: 'customer1@example.com' } as Customer,
        { id: uuid(), name: 'Customer 2', email: 'customer2@example.com' } as Customer
      ];

      jest.spyOn(offerService, 'getOfferById').mockResolvedValue(offer);
      jest.spyOn(customerService, 'getCustomers').mockResolvedValue(customers);
      jest.spyOn(voucherService, 'generateVouchersForBatch').mockResolvedValue();

      const result = await voucherService.generateVouchers(generateVoucherDto);

      expect(result).toBe(customers.length);
      expect(offerService.getOfferById).toHaveBeenCalledTimes(1);
      expect(offerService.getOfferById).toHaveBeenCalledWith(generateVoucherDto.offerId);
      expect(customerService.getCustomers).toHaveBeenCalledTimes(1);
      expect(voucherService.generateVouchersForBatch).toHaveBeenCalledTimes(1);
    });
  });

  describe('validateVoucherCode', () => {

    it('should validate the voucher code successfully', async () => {
      const validateVoucherDto: ValidateVoucherDto = {
        code: 'voucher-code',
        email: 'Mo@gmail.com'
      } as ValidateVoucherDto;

      const voucher = createVoucher(false);

      jest.spyOn(voucherService, 'getVoucherByCode').mockResolvedValue(voucher);

      const saveSpy = jest.spyOn(voucherRepository, 'save');

      const result = await voucherService.validateVoucherCode(validateVoucherDto);

      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(voucher?.offer?.discountPercentage);
    });

    it('should throw an error if the voucher code is not found', async () => {
      const validateVoucherDto: ValidateVoucherDto = {
        code: 'non-existent-code',
        email: 'test@example.com'
      };

      jest.spyOn(voucherService, 'getVoucherByCode').mockResolvedValue(undefined);

      await expect(voucherService.validateVoucherCode(validateVoucherDto)).rejects.toThrowError(
        new ApiException(VoucherErrors.VoucherNotFound, 'Voucher not found')
      );
    });

    it('should throw an error if the voucher is not valid for the provided email', async () => {
      const validateVoucherDto: ValidateVoucherDto = {
        code: 'voucher-code',
        email: 'invalid-email@example.com'
      };

      const voucher = createVoucher(false);

      jest.spyOn(voucherService, 'getVoucherByCode').mockResolvedValue(voucher);

      await expect(voucherService.validateVoucherCode(validateVoucherDto)).rejects.toThrowError(
        new ApiException(
          VoucherErrors.VoucherInvalidForProvidedEmail,
          'Voucher is not for the provided email'
        )
      );
    });


    it('should throw an error if the voucher is not in a valid status', async () => {
      const validateVoucherDto: ValidateVoucherDto = {
        code: 'voucher-code',
        email: 'Mo@gmail.com'
      };

      const voucher = createVoucher(true);

      jest.spyOn(voucherService, 'getVoucherByCode').mockResolvedValue(voucher);

      await expect(voucherService.validateVoucherCode(validateVoucherDto)).rejects.toThrowError(
        new ApiException(
          VoucherErrors.VoucherInvalid,
          `Voucher is not valid, already ${voucher.status}`
        )
      );

    });
  });


  describe('getValidVouchersByEmail', () => {

    const email = 'Mo@gmail.com';
    const customerMock= mockCustomer();
    const offerMock= mockOffer();
    const vouchersMock = Array(5).fill(createVoucher());

    it('should return valid vouchers for a valid customer', async () => {
      const email = 'Mo@gmail.com';

      jest.spyOn(customerService, 'getCustomerByEmail').mockResolvedValue(customerMock);

      // Replace this with a mock implementation of getValidVouchersForCustomer
      jest.spyOn(voucherService, 'getValidVouchersForCustomer').mockResolvedValue(vouchersMock);

      const result = await voucherService.getValidVouchersByEmail(email);

      expect(result).toEqual(vouchersMock.map(voucher => {
        const offerName = voucher.offer ? voucher.offer.name : '';
        return new ValidVoucherCodeDto({ code: voucher.code, offerName });
      }));
    });

    it('should throw ApiException for non-existent customer', async () => {
      const email = 'non_existent@example.com';

      jest.spyOn(customerService, 'getCustomerByEmail').mockResolvedValue(null);

      await expect(voucherService.getValidVouchersByEmail(email)).rejects.toThrow(
        new ApiException(CustomerErrors.CustomerNotFound, 'Customer with provided email not found')
      );
    });

    it('should return an empty array for a valid customer with no valid vouchers', async () => {
      const email = 'Mo@gmail.com';

      jest.spyOn(customerService, 'getCustomerByEmail').mockResolvedValue(customerMock);

      // Replace this with a mock implementation of getValidVouchersForCustomer
      jest.spyOn(voucherService, 'getValidVouchersForCustomer').mockResolvedValue([]);

      const result = await voucherService.getValidVouchersByEmail(email);

      expect(result).toEqual([]);
    });
  });


  //helper functions
  function mockCustomer(): Customer {
    return {
      id: uuid(),
      name: 'Mo Ali',
      email: 'Mo@gmail.com'
    } as Customer;
  }

  function mockOffer(): Offer {
    const offer = new Offer();
    offer.id = uuid();
    offer.name = 'Discount Offer';
    offer.discountPercentage = 10;
    return offer;
  }

  function createVoucher(redeemed = false): Voucher {
    const voucher = new Voucher();
    voucher.code = 'voucher-code';
    voucher.customer = mockCustomer();
    voucher.offer = mockOffer();
    voucher.redeemedAt = redeemed ? new Date('2023-12-31') : null;
    voucher.expireAt = new Date('2023-12-31');
    return voucher;
  }


});
