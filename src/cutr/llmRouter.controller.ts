import {
  All,
  Controller,
  Options,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { BearerTokenGuard } from '../auth/bearer-token.guard';
import { LlmRouterService } from './llmRouter.service';

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST,OPTIONS',
  'access-control-allow-headers': 'content-type, authorization, x-trace-id',
};
const ALLOW_HEADER = 'POST, OPTIONS';

function isMultipart(req: Request): boolean {
  return (req.headers['content-type'] || '')
    .toString()
    .toLowerCase()
    .includes('multipart/form-data');
}

function isJson(req: Request): boolean {
  const contentType = (req.headers['content-type'] || '')
    .toString()
    .toLowerCase();
  return contentType === '' || contentType.includes('application/json');
}

type ErrorBody = {
  error: string;
  code?: string;
  traceId?: string;
  details?: any;
};

@Controller('api/cutr')
export class LlmRouterController {
  constructor(private readonly svc: LlmRouterService) {}

  @Options('llmRouter')
  options(@Req() req: Request, @Res() res: Response) {
    const traceId = this.resolveTraceId(req);
    res.setHeader('x-trace-id', traceId);
    return res.status(204).set({ ...CORS_HEADERS, Allow: ALLOW_HEADER }).send();
  }

  @Post('llmRouter')
  @UseGuards(BearerTokenGuard)
  async llmRouter(@Req() req: Request, @Res() res: Response) {
    const traceId = this.resolveTraceId(req);
    const multipart = isMultipart(req);
    res.set(CORS_HEADERS);
    res.set(JSON_HEADERS);
    res.setHeader('x-trace-id', traceId);
    res.setHeader('cache-control', 'no-store');

    try {
      if (!isJson(req) && !multipart) {
        throw {
          status: 415,
          message:
            'Unsupported media type. Use application/json or multipart/form-data',
          code: 'UNSUPPORTED_MEDIA_TYPE',
        };
      }

      const parsed = multipart
        ? await this.svc.parseMultipart(req, traceId)
        : { body: req.body ?? {}, attachments: [] };
      const out = await this.svc.handle(parsed.body, traceId, parsed.attachments);
      return res.status(200).send(JSON.stringify(out));
    } catch (e: any) {
      const status = typeof e?.status === 'number' ? e.status : 500;
      const body: ErrorBody = {
        error:
          typeof e?.message === 'string' && e.message.trim()
            ? e.message
            : 'Internal server error',
        ...(e?.code ? { code: e.code } : {}),
        traceId,
        ...(e?.details !== undefined ? { details: e.details } : {}),
      };
      return res.status(status).send(JSON.stringify(body));
    }
  }

  @All('llmRouter')
  methodNotAllowed(@Req() req: Request, @Res() res: Response) {
    const traceId = this.resolveTraceId(req);
    const body = {
      error: 'Method not allowed',
      traceId,
    };

    res.setHeader('x-trace-id', traceId);
    return res
      .status(405)
      .set({ ...JSON_HEADERS, ...CORS_HEADERS, Allow: ALLOW_HEADER })
      .send(JSON.stringify(body));
  }

  private resolveTraceId(req: Request): string {
    return (
      (req.header('x-trace-id') || req.header('X-Trace-Id'))?.trim() ||
      randomUUID()
    );
  }
}
