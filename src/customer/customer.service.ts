import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerDto } from './dto/customer.dto';
import { isUUID } from 'class-validator';
import { CustomerErrors } from './enum/customer-errors.enum';
import { ApiException } from '../shared/api.exception';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {
  }


  async getCustomerByEmail(email: string): Promise<Customer> {
    return this.customerRepository.findOne({ where: { email } });
  }

  async createCustomer(
    createCustomerDto: CreateCustomerDto
  ): Promise<CustomerDto> {
    const customer = await this.getCustomerByEmail(createCustomerDto.email);
    if (customer) {
      throw new ApiException(
        CustomerErrors.EmailTaken,
        'Customer with entered email is already registered'
      );
    }
    const newCustomer = this.customerRepository.create(createCustomerDto);
    const savedCustomer = await this.customerRepository.save(newCustomer);
    return this.mapToDto(savedCustomer);
  }

  async getCustomers(): Promise<Array<Customer>> {
    return this.customerRepository.find();
  }

  async getCustomersMapped(): Promise<CustomerDto[]> {
    const customers = await this.customerRepository.find();
    return customers.map(customer => this.mapToDto(customer));
  }

  // Helper functions
  private mapToDto(customer: Customer): CustomerDto {
    const { id, name, email } = customer;
    return new CustomerDto({ id, name, email });
  }

}
