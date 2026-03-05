import { Module } from '@nestjs/common';
import { LlmBridgeController } from './llmBridge.controller';
import { LlmBridgeService } from './llmBridge.service';

@Module({
  controllers: [LlmBridgeController],
  providers: [LlmBridgeService],
})
export class AsunderModule {}
