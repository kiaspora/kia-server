import { Module } from '@nestjs/common';
import { PromptConfigController } from './promptConfig.controller';
import { PromptConfigService } from './promptConfig.service';

@Module({
  controllers: [PromptConfigController],
  providers: [PromptConfigService],
  exports: [PromptConfigService],
})
export class PromptConfigModule {}
