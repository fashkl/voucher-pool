import { INestApplication } from '@nestjs/common';
import { ApiTags, DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CustomerModule } from './src/customer/customer.module';
import { OfferModule } from './src/offer/offer.module';
import { VoucherModule } from './src/voucher/voucher.module';

export function useSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle('Voucher Pool API')
    .setDescription('API for managing vouchers')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options, {
    include: [
      CustomerModule,
      OfferModule,
      VoucherModule
    ]
  });

  SwaggerModule.setup('api', app, document);
}
