import { Test, TestingModule } from '@nestjs/testing';
import { VoucherController } from './voucher.controller';
import { VoucherService } from './voucher.service';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ThrottlerModule } from '@nestjs/throttler';
import { GenerateVoucherDto } from './dto/generate-voucher.dto';
import { ApiException } from '../shared/api.exception';
import { OfferErrors } from '../offer/enum/offer-errors.enum';
import { v4 as uuid } from 'uuid';
import { ValidateVoucherDto } from './dto/validate-voucher.dto';
import { VoucherErrors } from './enum/voucher-errors.enum';
import { generateRandomText } from '../shared/utils';
import { CustomerErrors } from '../customer/enum/customer-errors.enum';
import { ValidVoucherCodeDto } from './dto/valid-voucher-code.dto';


describe('VoucherController', () => {
  let app: INestApplication;
  let voucherService: VoucherService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot()],
      controllers: [VoucherController],
      providers: [
        {
          provide: VoucherService,
          useFactory: () => ({
            generateVouchers: jest.fn(),
            validateVoucherCode: jest.fn(),
            getValidVouchersByEmail: jest.fn()
          })
        }
      ]
    }).compile();

    app = moduleFixture.createNestApplication();
    voucherService = moduleFixture.get<VoucherService>(VoucherService);
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('generateVoucher', () => {
    it('should generate vouchers successfully', async () => {
      const generateVoucherDto: GenerateVoucherDto = {
        offerId: uuid(),
        expireAt: new Date('2023-12-31')
      };

      const numberOfCustomers = 100; // number of customers for testing
      const expectedResult = 100; // expected result based on the implementation

      jest.spyOn(voucherService, 'generateVouchers').mockResolvedValue(expectedResult);

      const response = await request(app.getHttpServer())
        .post('/v1/voucher/generate')
        .send(generateVoucherDto)
        .expect(HttpStatus.CREATED);


      expect(Number(response.text)).toBe(numberOfCustomers);
    });

    it('should throw an error if offer is invalid', async () => {
      const generateVoucherDto: GenerateVoucherDto = {
        offerId: uuid(),
        expireAt: new Date('2023-12-31')
      };

      jest.spyOn(voucherService, 'generateVouchers').mockRejectedValue(
        new ApiException(OfferErrors.OfferNotFound, 'Offer not found')
      );

      const response = await request(app.getHttpServer())
        .post('/v1/voucher/generate')
        .send(generateVoucherDto)
        .expect(HttpStatus.BAD_REQUEST);


      expect(response?.body?.message).toEqual('Offer not found');
      expect(response?.body?.errorCode).toEqual('OFFER_NOT_FOUND');
    });
  });

  describe('validateVoucher', () => {
    const validateVoucherDto = new ValidateVoucherDto({
      code: generateRandomText(10),
      email: 'Mo@gmail.com'
    });

    it('should validate and redeem a voucher code for a customer', async () => {
      const expectedResult = 50;

      jest.spyOn(voucherService, 'validateVoucherCode').mockResolvedValue(expectedResult);

      const response = await request(app.getHttpServer())
        .post('/v1/voucher/validate')
        .send(validateVoucherDto)
        .expect(HttpStatus.CREATED);

      expect(Number(response.text)).toBe(expectedResult);
    });

    it('should throw an error if voucher is not found', async () => {
      jest.spyOn(voucherService, 'validateVoucherCode').mockRejectedValue(
        new ApiException(VoucherErrors.VoucherNotFound, 'Voucher not found')
      );

      const response = await request(app.getHttpServer())
        .post('/v1/voucher/validate')
        .send(validateVoucherDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual('Voucher not found');
      expect(response.body.errorCode).toEqual(VoucherErrors.VoucherNotFound);
    });

    it('should throw an error if voucher code not for provided email', async () => {
      jest.spyOn(voucherService, 'validateVoucherCode').mockRejectedValue(
        new ApiException(VoucherErrors.VoucherInvalidForProvidedEmail, 'Voucher is not for the provided email')
      );

      const response = await request(app.getHttpServer())
        .post('/v1/voucher/validate')
        .send(validateVoucherDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.errorCode).toEqual(VoucherErrors.VoucherInvalidForProvidedEmail);
      expect(response.body.message).toEqual('Voucher is not for the provided email');
    });

    it('should throw an error if voucher status is not valid', async () => {
      jest.spyOn(voucherService, 'validateVoucherCode').mockRejectedValue(
        new ApiException(VoucherErrors.VoucherInvalid, 'Voucher is not valid, already REDEEMED')
      );

      const response = await request(app.getHttpServer())
        .post('/v1/voucher/validate')
        .send(validateVoucherDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.errorCode).toEqual(VoucherErrors.VoucherInvalid);
      expect(response.body.message).toEqual('Voucher is not valid, already REDEEMED');
    });

  });

  describe('getValidVouchersByEmail', () => {
    it('should return an array of valid vouchers for the customer', async () => {
      const email = 'customer@example.com';
      const expectedValidVouchers: ValidVoucherCodeDto[] = [
        { code: 'valid-code-1', offerName: 'Offer 1' },
        { code: 'valid-code-2', offerName: 'Offer 2' }
      ];

      jest.spyOn(voucherService, 'getValidVouchersByEmail').mockResolvedValue(expectedValidVouchers);

      const response = await request(app.getHttpServer())
        .get('/v1/voucher/valid')
        .query({ email })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(expectedValidVouchers);
    });

    it('should throw an error if customer is not found', async () => {
      const email = 'nonexistent@example.com';

      jest.spyOn(voucherService, 'getValidVouchersByEmail').mockRejectedValue(
        new ApiException(CustomerErrors.CustomerNotFound, 'Customer with provided email not found')
      );

      const response = await request(app.getHttpServer())
        .get('/v1/voucher/valid')
        .query({ email })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual('Customer with provided email not found');
      expect(response.body.errorCode).toEqual(CustomerErrors.CustomerNotFound);
    });

  });

});
