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

function isMultipart(req: Request): boolean {
  return (req.headers['content-type'] || '').toString().toLowerCase().includes('multipart/form-data');
}

function isJson(req: Request): boolean {
  const contentType = (req.headers['content-type'] || '').toString().toLowerCase();
  return contentType === '' || contentType.includes('application/json');
}

@Controller('api/asunder')
export class LlmBridgeController {
  constructor(private readonly llmBridgeService: LlmBridgeService) {}

  @Options('llmBridge')
  options(@Req() req: Request, @Res() res: ExpressResponse) {
    const traceId = this.resolveTraceId(req);
    res.setHeader('X-Trace-Id', traceId);
    return res.status(204).set({ ...CORS_HEADERS, Allow: ALLOW_HEADER }).send();
  }

  @Options('openPrompt')
  openPromptOptions(@Req() req: Request, @Res() res: ExpressResponse) {
    const traceId = this.resolveTraceId(req);
    res.setHeader('X-Trace-Id', traceId);
    return res.status(204).set({ ...CORS_HEADERS, Allow: ALLOW_HEADER }).send();
  }

  @Post('llmBridge')
  @UseGuards(BearerTokenGuard)
  async post(@Req() req: Request, @Res() res: ExpressResponse) {
    const traceId = this.resolveTraceId(req);
    const multipart = isMultipart(req);

    res.setHeader('X-Trace-Id', traceId);

    try {
      if (!isJson(req) && !multipart) {
        throw new LlmBridgeError(415, 'Unsupported media type', {
          error: {
            message: 'Unsupported media type. Use application/json or multipart/form-data',
            type: 'invalid_request_error',
          },
          trace_id: traceId,
        });
      }

      const parsed = multipart
        ? await this.llmBridgeService.parseMultipart(req, traceId)
        : { body: req.body, attachments: [] };
      const isStreaming = parsed.body?.stream === true;
      const upstream = await this.llmBridgeService.forward(
        parsed.body,
        traceId,
        parsed.attachments,
      );

      if (isStreaming && upstream.ok && upstream.body) {
        return await this.pipeSse(upstream, res, traceId);
      }

      return await this.sendJson(upstream, res, traceId);
    } catch (error: any) {
      console.error(
        `[asunder.llmBridge] request failure trace=${traceId} multipart=${multipart}:`,
        error?.stack || error?.message || String(error),
      );
      return this.sendLocalError(res, traceId, error);
    }
  }

  @Post('openPrompt')
  @UseGuards(BearerTokenGuard)
  async openPrompt(@Req() req: Request, @Res() res: ExpressResponse) {
    const traceId = this.resolveTraceId(req);
    res.setHeader('X-Trace-Id', traceId);

    try {
      if (!isJson(req)) {
        throw new LlmBridgeError(415, 'Unsupported media type', {
          error: {
            message: 'Unsupported media type. Use application/json',
            type: 'invalid_request_error',
          },
          trace_id: traceId,
        });
      }

      const body = this.normalizeOpenPromptBody(req.body);
      const upstream = await this.llmBridgeService.forward(body, traceId);

      return await this.sendJson(upstream, res, traceId);
    } catch (error: any) {
      console.error(
        `[asunder.openPrompt] request failure trace=${traceId}:`,
        error?.stack || error?.message || String(error),
      );
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

  @All('openPrompt')
  openPromptMethodNotAllowed(@Req() req: Request, @Res() res: ExpressResponse) {
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
        error.body && typeof error.body === 'object'
          ? { ...(error.body as Record<string, unknown>), trace_id: traceId }
          : {
              error: {
                message: error.message,
                type: 'server_error',
              },
              trace_id: traceId,
            };

      return res
        .status(error.statusCode)
        .set({ ...JSON_HEADERS, ...CORS_HEADERS, 'Cache-Control': 'no-store' })
        .send(JSON.stringify(body));
    }

    const details =
      error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unexpected failure';
    const body = {
      error: {
        message: 'Internal server error',
        type: 'server_error',
        details,
      },
      trace_id: traceId,
    };

    return res
      .status(500)
      .set({ ...JSON_HEADERS, ...CORS_HEADERS, 'Cache-Control': 'no-store' })
      .send(JSON.stringify(body));
  }

  private normalizeOpenPromptBody(value: unknown) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new LlmBridgeError(400, 'Request body must be a JSON object', {
        error: {
          message: 'Request body must be a JSON object',
          type: 'invalid_request_error',
        },
      });
    }

    const body = value as Record<string, unknown>;
    const promptId = typeof body.promptId === 'string' ? body.promptId.trim() : '';
    const promptVersionValue = body.promptVersion ?? body.prompytVersion;
    const input = typeof body.input === 'string' ? body.input : undefined;
    const stream = body.stream ?? false;
    const model = (process.env.OPENAI_ACTIVE_MODEL || '').trim();

    if (!model) {
      throw new LlmBridgeError(500, 'OPENAI_ACTIVE_MODEL missing', {
        error: {
          message: 'Server misconfigured: OPENAI_ACTIVE_MODEL missing',
          type: 'server_error',
        },
      });
    }

    if (!promptId) {
      throw new LlmBridgeError(400, 'promptId must be a non-empty string', {
        error: {
          message: 'promptId must be a non-empty string',
          type: 'invalid_request_error',
        },
      });
    }

    if (!Number.isInteger(promptVersionValue) || Number(promptVersionValue) < 1) {
      throw new LlmBridgeError(400, 'promptVersion must be a positive integer', {
        error: {
          message: 'promptVersion must be a positive integer',
          type: 'invalid_request_error',
        },
      });
    }

    if (typeof input !== 'string' || !input.trim()) {
      throw new LlmBridgeError(400, 'input must be a non-empty string', {
        error: {
          message: 'input must be a non-empty string',
          type: 'invalid_request_error',
        },
      });
    }

    if (typeof stream !== 'boolean') {
      throw new LlmBridgeError(400, 'stream must be a boolean', {
        error: {
          message: 'stream must be a boolean',
          type: 'invalid_request_error',
        },
      });
    }

    return {
      model,
      promptId,
      promptVersion: Number(promptVersionValue),
      input,
      stream,
    };
  }

  private resolveTraceId(req: Request): string {
    return (req.header('x-trace-id') || req.header('X-Trace-Id') || '').trim() || randomUUID();
  }
}
