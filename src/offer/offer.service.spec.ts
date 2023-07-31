import { Test, TestingModule } from '@nestjs/testing';
import { OfferService } from './offer.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './offer.entity';
import { OfferDto } from './dto/offer.dto';
import { CreateOfferDto } from './dto/create-offer.dto';

describe('OfferService', () => {
  let offerService: OfferService;
  let offerRepository: Repository<Offer>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfferService,
        {
          provide: getRepositoryToken(Offer),
          useClass: Repository<Offer>
        }
      ]
    }).compile();

    offerService = module.get<OfferService>(OfferService);
    offerRepository = module.get<Repository<Offer>>(getRepositoryToken(Offer));

  });

  it('should be defined', () => {
    expect(offerService).toBeDefined();
  });


  describe('createOffer', () => {
    const mockOffer: Offer = {
      id: 'some-id',
      name: 'Discount Offer',
      discountPercentage: 10
    } as Offer;

    const mockCreateOfferDto: CreateOfferDto = {
      name: 'Discount Offer',
      discountPercentage: 10
    } as CreateOfferDto;

    it('should create an offer and return the DTO', async () => {
      jest.spyOn(offerRepository, 'create').mockReturnValue(mockOffer);
      jest.spyOn(offerRepository, 'save').mockResolvedValue(mockOffer);

      const response = await offerService.createOffer(mockCreateOfferDto);

      expect(offerRepository.create).toHaveBeenCalledTimes(1);
      expect(offerRepository.create).toHaveBeenCalledWith(mockCreateOfferDto);
      expect(offerRepository.save).toHaveBeenCalledTimes(1);
      expect(offerRepository.save).toHaveBeenCalledWith(mockOffer);

      const expectedDto: OfferDto = {
        id: mockOffer.id,
        name: mockOffer.name,
        discountPercentage: mockOffer.discountPercentage
      };
      expect(response).toEqual(expectedDto);
    });

  });

});
