import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { MetaController } from './meta/meta.controller';
import { ParseController } from './parse/parse.controller';
import { ImdbSearchController } from './parse/imdb-search.controller';

import { TraceIdMiddleware } from './common/trace-id.middleware';
import { TraceIdInterceptor } from './common/trace-id.interceptor';

@Module({
  imports: [],
  controllers: [MetaController, ParseController, ImdbSearchController],
  providers: [{ provide: APP_INTERCEPTOR, useClass: TraceIdInterceptor }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceIdMiddleware).forRoutes('*');
  }
}
