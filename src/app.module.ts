import { Module } from '@nestjs/common';
import { MetaController } from './meta/meta.controller';

@Module({
  imports: [],
  controllers: [MetaController],
  providers: [],
})
export class AppModule {}

