import { Module } from '@nestjs/common';
import { SpeechToTextController } from './speechToText.controller';
import { SpeechToTextService } from './speechToText.service';

@Module({
  controllers: [SpeechToTextController],
  providers: [SpeechToTextService],
  exports: [SpeechToTextService],
})
export class SpeechToTextModule {}
