import { All, Controller, Options, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { BearerTokenGuard } from '../auth/bearer-token.guard';
import { LlmRouterService } from './llmRouter.service';

const JSON_HEADERS = { 'content-type': 'application/json' };
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST,OPTIONS',
  'access-control-allow-headers': 'content-type, authorization, x-trace-id',
};
const ALLOW_HEADER = 'POST, OPTIONS';

@Controller('api/justus')
export class LlmRouterController {
  constructor(private readonly llmRouterService: LlmRouterService) {}

  @Options('llmRouter')
  options(@Req() req: Request, @Res() res: Response) {
    const traceId = this.resolveTraceId(req);
    res.setHeader('X-Trace-Id', traceId);
    return res.status(204).set({ ...CORS_HEADERS, Allow: ALLOW_HEADER }).send();
  }

  @Post('llmRouter')
  @UseGuards(BearerTokenGuard)
  async post(@Req() req: Request, @Res() res: Response) {
    const traceId = this.resolveTraceId(req);
    const result = await this.llmRouterService.route(this.toBodyRaw(req.body), traceId);

    res.setHeader('X-Trace-Id', traceId);
    return res
      .status(result.statusCode)
      .set({ ...JSON_HEADERS, ...CORS_HEADERS, 'Cache-Control': 'no-store' })
      .send(JSON.stringify(result.body));
  }

  @All('llmRouter')
  methodNotAllowed(@Req() req: Request, @Res() res: Response) {
    const traceId = this.resolveTraceId(req);
    const body = {
      errors: ['Method not allowed'],
      trace_id: traceId,
    };

    res.setHeader('X-Trace-Id', traceId);
    return res
      .status(405)
      .set({ ...JSON_HEADERS, ...CORS_HEADERS, Allow: ALLOW_HEADER })
      .send(JSON.stringify(body));
  }

  private resolveTraceId(req: Request): string {
    return (req.header('x-trace-id') || req.header('X-Trace-Id') || '').trim() || randomUUID();
  }

  private toBodyRaw(body: unknown): string | undefined {
    if (body == null) return undefined;
    if (typeof body === 'string') return body;
    try {
      return JSON.stringify(body);
    } catch {
      return undefined;
    }
  }
}
