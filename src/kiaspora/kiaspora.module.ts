import { Module } from '@nestjs/common';
import { TranslationRouterController } from './translationRouter.controller';
import { TranslationRouterService } from './translationRouter.service';
import { TranslationChatModule } from './translationChat.module';

@Module({
  controllers: [TranslationRouterController],
  providers: [TranslationRouterService],
  imports: [TranslationChatModule],
})
export class KiasporaModule {}
