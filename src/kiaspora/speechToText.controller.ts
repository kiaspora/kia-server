import { Body, Controller, HttpCode, Options, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { BearerTokenGuard } from '../auth/bearer-token.guard';
import { SpeechToTextService } from './speechToText.service';

type RouterBody = {
  languageCode?: unknown;
  altLanguageCodes?: unknown;
  languageCodes?: unknown;
  model?: unknown;
  mimeType?: unknown;
  base64Audio?: unknown; // JSON path
  sampleRateHertz?: unknown;
  traceId?: unknown;
};

function isMultipart(req: Request): boolean {
  const ct = (req.headers['content-type'] || '').toString();
  return ct.toLowerCase().includes('multipart/form-data');
}

@Controller('api/kiaspora')
@UseGuards(BearerTokenGuard)
export class SpeechToTextController {
  constructor(private readonly svc: SpeechToTextService) {}

  // Keep preflight behavior compatible (empty 204).
  @Options('speechToText')
  @HttpCode(204)
  async options(): Promise<void> {
    return;
  }

  @Post('speechToText')
  async handler(@Req() req: Request, @Body() body: RouterBody) {
    // Multipart bodies are not JSON-parsed; parse from stream instead.
    const parsed: { body: RouterBody; audioBase64?: string } = isMultipart(req)
      ? await this.svc.parseMultipart(req)
      : { body: this.svc.parseJsonBody(body), audioBase64: undefined };

    // Outputs must remain the same as the Cloud Function (no envelope).
    return this.svc.run(parsed.body, req, parsed.audioBase64);
  }
}
