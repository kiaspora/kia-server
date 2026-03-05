import { All, Controller, Options, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response as ExpressResponse } from 'express';
import { randomUUID } from 'node:crypto';
import { BearerTokenGuard } from '../auth/bearer-token.guard';
import { LlmBridgeError, LlmBridgeService } from './llmBridge.service';

const JSON_HEADERS = { 'content-type': 'application/json' };
const SSE_HEADERS = {
  'content-type': 'text/event-stream; charset=utf-8',
  connection: 'keep-alive',
};
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST,OPTIONS',
  'access-control-allow-headers': 'content-type, authorization, x-trace-id',
};
const ALLOW_HEADER = 'POST, OPTIONS';

@Controller('api/asunder')
export class LlmBridgeController {
  constructor(private readonly llmBridgeService: LlmBridgeService) {}

  @Options('llmBridge')
  options(@Req() req: Request, @Res() res: ExpressResponse) {
    const traceId = this.resolveTraceId(req);
    res.setHeader('X-Trace-Id', traceId);
    return res.status(204).set({ ...CORS_HEADERS, Allow: ALLOW_HEADER }).send();
  }

  @Post('llmBridge')
  @UseGuards(BearerTokenGuard)
  async post(@Req() req: Request, @Res() res: ExpressResponse) {
    const traceId = this.resolveTraceId(req);
    const isStreaming = req.body?.stream === true;

    res.setHeader('X-Trace-Id', traceId);

    try {
      const upstream = await this.llmBridgeService.forward(req.body, traceId);

      if (isStreaming && upstream.ok && upstream.body) {
        return await this.pipeSse(upstream, res, traceId);
      }

      return await this.sendJson(upstream, res, traceId);
    } catch (error: any) {
      return this.sendLocalError(res, traceId, error);
    }
  }

  @All('llmBridge')
  methodNotAllowed(@Req() req: Request, @Res() res: ExpressResponse) {
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

  private async pipeSse(
    upstream: globalThis.Response,
    res: ExpressResponse,
    traceId: string,
  ) {
    res.status(upstream.status);
    res.set({
      ...CORS_HEADERS,
      ...SSE_HEADERS,
      'Cache-Control': 'no-store',
    });
    res.flushHeaders();

    const reader = upstream.body?.getReader();
    if (!reader) {
      res.end();
      return;
    }

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) res.write(Buffer.from(value));
      }
    } catch (error: any) {
      console.error(
        `[asunder.llmBridge] stream error trace=${traceId}:`,
        error?.message ?? String(error),
      );
    } finally {
      res.end();
    }
  }

  private async sendJson(
    upstream: globalThis.Response,
    res: ExpressResponse,
    traceId: string,
  ) {
    const text = await upstream.text().catch(() => '');
    const contentType = upstream.headers.get('content-type') || JSON_HEADERS['content-type'];
    const xRequestId = upstream.headers.get('x-request-id');
    const headers: Record<string, string> = {
      ...CORS_HEADERS,
      'Cache-Control': 'no-store',
      'content-type': contentType,
    };

    if (xRequestId) headers['x-request-id'] = xRequestId;

    res.setHeader('X-Trace-Id', traceId);
    return res.status(upstream.status).set(headers).send(text);
  }

  private sendLocalError(res: ExpressResponse, traceId: string, error: unknown) {
    if (error instanceof LlmBridgeError) {
      const body =
        error.body ??
        ({
          error: {
            message: error.message,
            type: 'server_error',
          },
        } as const);

      return res
        .status(error.statusCode)
        .set({ ...JSON_HEADERS, ...CORS_HEADERS, 'Cache-Control': 'no-store' })
        .send(JSON.stringify(body));
    }

    const body = {
      error: {
        message: 'Internal server error',
        type: 'server_error',
      },
    };

    return res
      .status(500)
      .set({ ...JSON_HEADERS, ...CORS_HEADERS, 'Cache-Control': 'no-store' })
      .send(JSON.stringify(body));
  }

  private resolveTraceId(req: Request): string {
    return (req.header('x-trace-id') || req.header('X-Trace-Id') || '').trim() || randomUUID();
  }
}
