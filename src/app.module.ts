import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { MetaController } from './meta/meta.controller';
import { ParseController } from './parse/parse.controller';
import { ImdbSearchController } from './parse/imdb-search.controller';
import { ImdbDetailController } from './parse/imdb-detail.controller';

import { GenerateReviewModule } from './generate-review/generate-review.module';
import { JustUsModule } from './justus/justus.module';

import { KiasporaModule } from './kiaspora/kiaspora.module';

import { TraceIdMiddleware } from './common/trace-id.middleware';
import { TraceIdInterceptor } from './common/trace-id.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // loads .env
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
    }),
    GenerateReviewModule,
    KiasporaModule,
    JustUsModule,
  ],
  controllers: [
    MetaController,
    ParseController,
    ImdbSearchController,
    ImdbDetailController,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TraceIdInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceIdMiddleware).forRoutes('*');
  }
}
