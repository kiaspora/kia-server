import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ limit: '20mb', extended: true }));

  const env = process.env.NODE_ENV ?? 'development';
  const enableSwagger = process.env.ENABLE_SWAGGER === 'true' || env !== 'production';

  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('API')
      .setDescription('NestJS API')
      .setVersion(process.env.npm_package_version ?? '0.0.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port);
}
bootstrap();
