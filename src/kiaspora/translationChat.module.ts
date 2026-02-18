import { Module } from '@nestjs/common';
import { TranslationChatController } from './translationChat.controller';
import { TranslationChatService } from './translationChat.service';

@Module({
  controllers: [TranslationChatController],
  providers: [TranslationChatService],
  exports: [TranslationChatService],
})
export class TranslationChatModule {}
