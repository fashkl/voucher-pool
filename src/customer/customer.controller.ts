import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  UsePipes,
  ValidationPipe, UseGuards
} from '@nestjs/common';
import { Customer } from './customer.entity';
import { CustomerService } from './customer.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerDto } from './dto/customer.dto';
import { ApiErrorHelper } from '../shared/api-error.helper';
import { ValidationErrorHelper } from '../shared/validation-error.helper';
import { CustomerErrors } from './enum/customer-errors.enum';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('v1/customer')
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(ThrottlerGuard)
@ApiTags('Customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @Throttle(5, 120)
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({
    status: 201,
    description: 'The customer has been successfully created.',
    type: CustomerDto
  })
  @ApiResponse(
    ApiErrorHelper([
      CustomerErrors.EmailTaken
    ])
  )
  @ApiResponse(
    ValidationErrorHelper([
      CustomerErrors.NameInvalid,
      CustomerErrors.EmailInvalid
    ])
  )
  createCustomer(
    @Body() createCustomerDto: CreateCustomerDto
  ): Promise<CustomerDto> {
    return this.customerService.createCustomer(createCustomerDto);
  }

  @Get()
  @Throttle(10, 120)
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of customers.',
    type: [CustomerDto]
  })
  getCustomers(): Promise<CustomerDto[]> {
    return this.customerService.getCustomersMapped();
  }
}
