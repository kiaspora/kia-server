import { Module } from '@nestjs/common';
import { TitleSearchController } from './titleSearch.controller';
import { TitleDetailController } from './titleDetail.controller';
import { FilmTrailerController } from './filmTrailer.controller';
import { FilmTrailerService } from './filmTrailer.service';
import { LlmRouterController } from './llmRouter.controller';
import { LlmRouterService } from './llmRouter.service';

// NEW
import { TrailersController } from './trailers.controller';

@Module({
  controllers: [
    TitleSearchController,
    TitleDetailController,
    FilmTrailerController,
    LlmRouterController,
    TrailersController, // NEW
  ],
  providers: [
    FilmTrailerService,
    LlmRouterService,
  ],
  imports: [],
})
export class JustUsModule {}