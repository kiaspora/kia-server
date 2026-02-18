import { Module } from '@nestjs/common';
import { TranslationRouterController } from './translationRouter.controller';
import { TranslationRouterService } from './translationRouter.service';

@Module({
  controllers: [TranslationRouterController],
  providers: [TranslationRouterService],
})
export class KiasporaModule {}
