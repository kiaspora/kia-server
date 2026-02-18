import { Module } from '@nestjs/common';
import { TranslationRouterController } from './translationRouter.controller';
import { TranslationRouterService } from './translationRouter.service';
import { TranslationChatModule } from './translationChat.module';
import { ImageScanModule } from './imageScan.module';
import { SpeechToTextModule } from './speechToText.module';
import { PromptConfigModule } from './promptConfig.module';

@Module({
  controllers: [TranslationRouterController],
  providers: [TranslationRouterService],
  imports: [TranslationChatModule, ImageScanModule, SpeechToTextModule, PromptConfigModule],
})
export class KiasporaModule {}
