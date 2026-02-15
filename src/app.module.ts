import { Module } from '@nestjs/common';
import { MetaController } from './meta/meta.controller';
import { ParseController } from './parse/parse.controller';
import { ImdbSearchController } from './parse/imdb-search.controller';

@Module({
  imports: [],
  controllers: [MetaController, ParseController, ImdbSearchController],
  providers: [],
})
export class AppModule {}
