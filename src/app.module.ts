import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import * as Joi from '@hapi/joi';
import { DatabaseModule } from './database/database.module';
import { CustomerModule } from './customer/customer.module';
import { OfferModule } from './offer/offer.module';
import { VoucherModule } from './voucher/voucher.module';


@Module({
  imports: [
    LoggerModule.forRoot({}),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().default(3001),
        // DB-CREDENTIALS
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required()
      })
    }),
    DatabaseModule,
    CustomerModule,
    OfferModule,
    VoucherModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
