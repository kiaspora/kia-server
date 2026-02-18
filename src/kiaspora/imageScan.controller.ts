import { Body, Controller, HttpCode, Options, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { BearerTokenGuard } from '../auth/bearer-token.guard';
import { ImageScanService } from './imageScan.service';

type RouterBody = {
  aiProvider?: unknown;
  base64Image?: unknown;
  mimeType?: unknown;
  customPrompt?: unknown;
  traceId?: unknown;
  imageUrl?: unknown;
};

function isMultipart(req: Request): boolean {
  const ct = (req.headers['content-type'] || '').toString();
  return ct.toLowerCase().includes('multipart/form-data');
}

@Controller('api/kiaspora')
@UseGuards(BearerTokenGuard)
export class ImageScanController {
  constructor(private readonly svc: ImageScanService) {}

  // Keep preflight behavior compatible (empty 204).
  @Options('imageScan')
  @HttpCode(204)
  async options(): Promise<void> {
    return;
  }

  @Post('imageScan')
  async handler(@Req() req: Request, @Body() body: RouterBody) {
    // Multipart bodies are not JSON-parsed; parse from stream instead.
    const parsed: RouterBody = isMultipart(req) ? await this.svc.parseMultipart(req) : this.svc.parseJsonBody(body);

    // Outputs must remain the same as the Cloud Function (no envelope).
    return this.svc.run(parsed, req);
  }
}
