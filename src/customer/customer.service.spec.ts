import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerDto } from './dto/customer.dto';
import { v4 as uuid } from 'uuid';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomerErrors } from './enum/customer-errors.enum';
import { ApiException } from '../shared/api.exception';

describe('CustomerService', () => {
  let customerService: CustomerService;
  let customerRepository: Repository<Customer>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: getRepositoryToken(Customer),
          useClass: Repository<Customer>
        }
      ]
    }).compile();

    customerService = module.get<CustomerService>(CustomerService);
    customerRepository = module.get<Repository<Customer>>(
      getRepositoryToken(Customer)
    );

  });

  it('should be defined', () => {
    expect(customerService).toBeDefined();
  });

  describe('createCustomer', () => {
    const createCustomerDto: CreateCustomerDto = new CreateCustomerDto({
      name: 'Mo Ali',
      email: 'Mo@gmail.com'
    });

    it('should create a new customer and return the CustomerDto', async () => {
      customerRepository.findOne = jest.fn().mockResolvedValueOnce(null);

      const uid = uuid();
      const savedCustomer = { ...createCustomerDto, id: uid };
      customerRepository.create = jest.fn().mockReturnValue(createCustomerDto);
      customerRepository.save = jest.fn().mockResolvedValue(savedCustomer);

      const result: CustomerDto = await customerService.createCustomer(
        createCustomerDto
      );

      expect(result).toEqual(new CustomerDto({
        id: uid,
        name: 'Mo Ali',
        email: 'Mo@gmail.com'
      }));

    });

    it('should throw an error if customer with the provided email already exists', async () => {
      customerRepository.findOne = jest.fn().mockResolvedValueOnce(createCustomerDto);

      await expect(
        customerService.createCustomer(createCustomerDto)
      ).rejects.toThrowError(
        new ApiException(
          CustomerErrors.EmailTaken,
          'Customer with entered email is already registered'
        )
      );
    });

  });


});
