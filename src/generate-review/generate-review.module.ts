import { Module } from '@nestjs/common';
import { GenerateReviewController } from './generate-review.controller';
import { GenerateReviewService } from './generate-review.service';

@Module({
  controllers: [GenerateReviewController],
  providers: [GenerateReviewService],
})
export class GenerateReviewModule {}
