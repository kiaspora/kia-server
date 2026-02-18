import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { BearerTokenGuard } from '../auth/bearer-token.guard';
import { TranslationRouterService } from './translationRouter.service';

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST,OPTIONS',
  'access-control-allow-headers': 'content-type, authorization, x-trace-id',
};

type ErrorBody = { error: string; code?: string; traceId?: string; details?: any };

@Controller('api/kiaspora')
@UseGuards(BearerTokenGuard)
export class TranslationRouterController {
  constructor(private readonly svc: TranslationRouterService) {}

  @Post('translationRouter')
  async translationRouter(@Req() req: Request, @Res() res: Response) {
    const traceId = (req.header('x-trace-id') || req.header('X-Trace-Id'))?.trim() || randomUUID();

    // Preflight
    if (req.method === 'OPTIONS') {
      res.set(CORS_HEADERS);
      res.setHeader('x-trace-id', traceId);
      return res.status(204).send('');
    }

    res.set(CORS_HEADERS);
    res.set(JSON_HEADERS);
    res.setHeader('x-trace-id', traceId);
    res.setHeader('cache-control', 'no-store');

    try {
      const out = await this.svc.handle(req.body ?? {}, traceId);
      return res.status(200).send(JSON.stringify(out));
    } catch (e: any) {
      const status = typeof e?.status === 'number' ? e.status : 500;
      const body: ErrorBody = {
        error: typeof e?.message === 'string' && e.message.trim() ? e.message : 'Internal server error',
        ...(e?.code ? { code: e.code } : {}),
        traceId,
        ...(e?.details !== undefined ? { details: e.details } : {}),
      };
      return res.status(status).send(JSON.stringify(body));
    }
  }
}
