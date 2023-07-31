import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OfferDto } from './dto/offer.dto';
import { v4 as uuid } from 'uuid';
import { ThrottlerModule } from '@nestjs/throttler';


describe('OfferController', () => {
  let app: INestApplication;
  let offerService: OfferService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot()],
      controllers: [OfferController],
      providers: [
        {
          provide: OfferService,
          useFactory: () => ({
            createOffer: jest.fn(),
            getOffers: jest.fn()
          })
        }
      ]
    }).compile();

    app = moduleRef.createNestApplication();
    offerService = moduleRef.get<OfferService>(OfferService);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('createOffer', () => {
    const createOfferDto: CreateOfferDto = {
      name: 'Discount Offer',
      discountPercentage: 10
    };

    it('should create a new offer and return the DTO', async () => {
      const createdOffer: OfferDto = {
        id: uuid(),
        ...createOfferDto
      };

      jest.spyOn(offerService, 'createOffer').mockResolvedValue(createdOffer);

      const response = await request(app.getHttpServer())
        .post('/v1/offer')
        .send(createOfferDto)
        .expect(HttpStatus.CREATED);


      expect(offerService.createOffer).toHaveBeenCalledTimes(1);
      expect(offerService.createOffer).toHaveBeenCalledWith(createOfferDto);
      expect(response.body).toEqual(createdOffer);
    });
  });

  describe('getOffers', () => {
    it('should get all offers and return an array of DTOs', async () => {
      const offers: OfferDto[] = [
        {
          id: uuid(),
          name: 'Discount Offer 1',
          discountPercentage: 10
        },
        {
          id: uuid(),
          name: 'Discount Offer 2',
          discountPercentage: 15
        }
      ];

      jest.spyOn(offerService, 'getOffers').mockResolvedValue(offers);

      const response = await request(app.getHttpServer())
        .get('/v1/offer')
        .expect(HttpStatus.OK);

      expect(offerService.getOffers).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual(offers);
    });
  });
});
