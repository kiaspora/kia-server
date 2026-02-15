import { Module } from '@nestjs/common';
import { MetaController } from './meta/meta.controller';
import { ParseController } from './parse/parse.controller';

@Module({
  imports: [],
  controllers: [MetaController, ParseController],
  providers: [],
})
export class AppModule {}
