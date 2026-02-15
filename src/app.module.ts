import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import { MetaController } from './meta/meta.controller';
import { ParseController } from './parse/parse.controller';
import { ImdbSearchController } from './parse/imdb-search.controller';
import { ImdbDetailController } from './parse/imdb-detail.controller';

import { TitleSearchController } from './justus/titleSearch.controller';

import { TraceIdMiddleware } from './common/trace-id.middleware';
import { TraceIdInterceptor } from './common/trace-id.interceptor';

@Module({
  imports: [
      ConfigModule.forRoot({ isGlobal: true }), // loads .env
  ],
  controllers: [MetaController, ParseController, ImdbSearchController, ImdbDetailController, TitleSearchController],
  providers: [{ provide: APP_INTERCEPTOR, useClass: TraceIdInterceptor }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceIdMiddleware).forRoutes('*');
  }
}
