import {
  Body,
  Controller,
  HttpCode,
  Options,
  Post,
  UseGuards,
} from '@nestjs/common';

import { BearerTokenGuard } from '../auth/bearer-token.guard';
import {
  VoiceSessionService,
  type VoiceSessionRequest,
  type VoiceSessionResponse,
} from './voiceSession.service';

@Controller('voice')
@UseGuards(BearerTokenGuard)
export class VoiceSessionController {
  constructor(private readonly voiceSessionService: VoiceSessionService) {}

  @Options('session')
  @HttpCode(204)
  async options(): Promise<void> {
    return;
  }

  @Post('session')
  async createSession(
    @Body() body: VoiceSessionRequest
  ): Promise<VoiceSessionResponse> {
    return this.voiceSessionService.createSession(body);
  }
}
