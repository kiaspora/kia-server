import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { randomUUID } from 'crypto';

import { BearerTokenGuard } from '../auth/bearer-token.guard';
import { TranslationChatService } from './translationChat.service';

type TranslationChatBody = {
  // legacy field (kept)
  aiProvider?: string | null;
  // new field (matches your translationRouter contract)
  provider?: string | null;

  messages?: unknown;
  sourceLang?: unknown;
  targetLang?: unknown;
  context?: unknown;
  traceId?: unknown;
  customPrompt?: unknown;
};

function getTraceId(req: Request, body?: any): string {
  // Prefer platform middleware if present (tmpl-api-pattern.md suggests req.traceId)
  const fromMiddleware = (req as any)?.traceId;
  if (typeof fromMiddleware === 'string' && fromMiddleware.trim()) {
    return fromMiddleware.trim();
  }

  const fromHeader = req.headers['x-trace-id'];
  if (typeof fromHeader === 'string' && fromHeader.trim()) return fromHeader.trim();

  const bodyTrace = body?.traceId ?? body?.trace_id ?? body?.TraceId;
  if (typeof bodyTrace === 'string' && bodyTrace.trim()) return bodyTrace.trim();

  return randomUUID();
}

@Controller('api/kiaspora')
@UseGuards(BearerTokenGuard)
export class TranslationChatController {
  constructor(private readonly svc: TranslationChatService) {}

  // PATH REQUIRED: /api/kiaspora/translationChat
  @Post('translationChat')
  async handler(@Req() req: Request, @Body() body: TranslationChatBody) {
    const traceId = getTraceId(req, body);

    // Keep output contract EXACTLY like the Cloud Function:
    // { reply, traceId, aiProvider, latency_ms }
    return this.svc.run(body, traceId);
  }
}
