import { Module } from '@nestjs/common';
import { TranslationRouterController } from './translationRouter.controller';
import { TranslationRouterService } from './translationRouter.service';
import { TranslationChatModule } from './translationChat.module';
import { ImageScanModule } from './imageScan.module';
import { SpeechToTextModule } from './speechToText.module';
import { PromptConfigModule } from './promptConfig.module';
import { VoiceSessionController } from './voiceSession.controller';
import { VoiceSessionService } from './voiceSession.service';

@Module({
  controllers: [TranslationRouterController, VoiceSessionController],
  providers: [TranslationRouterService, VoiceSessionService],
  imports: [
    TranslationChatModule,
    ImageScanModule,
    SpeechToTextModule,
    PromptConfigModule,
  ],
})
export class KiasporaModule {}
