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
import { OfferService } from './offer.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OfferDto } from './dto/offer.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiErrorHelper } from '../shared/api-error.helper';
import { ValidationErrorHelper } from '../shared/validation-error.helper';
import { OfferErrors } from './enum/offer-errors.enum';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('v1/offer')
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(ThrottlerGuard)
@ApiTags('Offer')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Throttle(5, 120)
  @Post()
  @ApiOperation({ summary: 'Create a new offer' })
  @ApiResponse({
    status: 201,
    description: 'The offer has been successfully created.',
    type: OfferDto,
  })
  @ApiResponse(
    ApiErrorHelper([
      OfferErrors.OfferNotFound,
    ]),
  )
  @ApiResponse(
    ValidationErrorHelper([
      OfferErrors.OfferIdInvalid,
    ]),
  )
  async createOffer(@Body() createOfferDto: CreateOfferDto): Promise<OfferDto> {
    return this.offerService.createOffer(createOfferDto);
  }

  @Throttle(10, 120)
  @Get()
  @ApiOperation({ summary: 'Get all offers' })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of offers.',
    type: OfferDto,
    isArray: true,
  })
  async getOffers(): Promise<OfferDto[]> {
    return this.offerService.getOffers();
  }
}
