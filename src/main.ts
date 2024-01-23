import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as R from 'ramda';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.enableCors({
    exposedHeaders: ['X-HT6-Redirect'],
  });

  const builder = new DocumentBuilder()
    .setDescription(process.env.npm_package_description!)
    .setVersion(process.env.npm_package_version!)
    .setTitle(process.env.npm_package_title!)
    .addBearerAuth();

  const tags = (process.env.npm_package_keywords as unknown as string[]) ?? [];
  R.forEach(builder.addTag, tags);

  const document = SwaggerModule.createDocument(app, builder.build());
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get('PORT', 4321));
}

patchNestJsSwagger();
bootstrap();
