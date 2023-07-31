import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerDto } from './dto/customer.dto';
import { ApiException } from '../shared/api.exception';
import { CustomerErrors } from './enum/customer-errors.enum';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';


describe('CustomerController', () => {
  let app: INestApplication;
  let customerService: CustomerService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot()],
      controllers: [CustomerController],
      providers: [
        {
          provide: CustomerService,
          useFactory: () => ({
            createCustomer: jest.fn()
          })
        }
      ]
    }).compile();

    app = moduleFixture.createNestApplication();
    customerService = moduleFixture.get<CustomerService>(CustomerService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('createCustomer', () => {
    const createCustomerDto: CreateCustomerDto = new CreateCustomerDto({
      name: 'Mo Ali',
      email: 'mo@gmail.com'
    });
    const uid = uuid();

    it('should create a new customer and return the DTO', async () => {
      const createdCustomer: CustomerDto = new CustomerDto({
        id: uid,
        ...createCustomerDto
      });

      customerService.createCustomer = jest.fn().mockResolvedValue(createdCustomer);

      const response = await request(app.getHttpServer())
        .post('/v1/customer')
        .send(createCustomerDto);

      expect(response.body).toBeDefined();
      expect(customerService.createCustomer).toHaveBeenCalledWith(createCustomerDto);
      expect(response.body).toEqual(createdCustomer);
    });

    it('should throw an error if customer email is already taken', async () => {
      customerService.createCustomer = jest.fn()
        .mockRejectedValue(
          new ApiException(CustomerErrors.EmailTaken, 'Email already taken')
        );

      const response = await request(app.getHttpServer())
        .post('/v1/customer')
        .send(createCustomerDto)

      expect(response.body.message).toEqual('Email already taken');
      expect(response.body.errorCode).toEqual(CustomerErrors.EmailTaken);
    });
  });
});