import { Module } from '@nestjs/common';
import { LlmRouterController } from './llmRouter.controller';
import { LlmRouterService } from './llmRouter.service';

@Module({
  controllers: [LlmRouterController],
  providers: [LlmRouterService],
})
export class CutrModule {}
