import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OfferDto } from './dto/offer.dto';
import { isUUID } from 'class-validator';
import { ApiException } from '../shared/api.exception';
import { OfferErrors } from './enum/offer-errors.enum';

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>
  ) {
  }

  async getOfferById(id: string): Promise<Offer> {
    this.validateOfferId(id);
    const offer = await this.offerRepository.findOne({ where: { id } });
    if (!offer) {
      throw new ApiException(OfferErrors.OfferNotFound, 'Offer not found');
    }
    return offer;
  }

  async createOffer(createOfferDto: CreateOfferDto): Promise<OfferDto> {
    const newOffer = this.offerRepository.create(createOfferDto);
    const savedOffer = await this.offerRepository.save(newOffer);
    return this.mapToDto(savedOffer);
  }

  async getOffers(): Promise<OfferDto[]> {
    const offers = await this.offerRepository.find();
    return offers.map(offer => this.mapToDto(offer));
  }

  // Helper functions
  private mapToDto(offer: Offer): OfferDto {
    const { id, name, discountPercentage } = offer;
    return new OfferDto({ id, name, discountPercentage });
  }

  private validateOfferId(id: string): void {
    if (!isUUID(id, '4')) {
      throw new BadRequestException('Invalid Offer ID');
    }
  }
}
