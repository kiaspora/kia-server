import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  Options,
  HttpCode,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

import { BearerTokenGuard } from '../auth/bearer-token.guard';
import { PromptConfigService } from './promptConfig.service';

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'access-control-allow-headers': 'content-type, authorization, x-trace-id',
};

type ErrorBody = { error: string };

@Controller('api/kiaspora')
@UseGuards(BearerTokenGuard)
export class PromptConfigController {
  constructor(private readonly svc: PromptConfigService) {}

  private getTraceId(req: Request) {
    return (req.header('x-trace-id') || req.header('X-Trace-Id') || '').trim() || randomUUID();
  }

  private setup(res: Response, traceId: string) {
    res.set(CORS_HEADERS);
    res.set(JSON_HEADERS);
    res.setHeader('X-Trace-Id', traceId);
    res.setHeader('Cache-Control', 'no-store');
  }

  private send(res: Response, status: number, body: any) {
    return res.status(status).send(JSON.stringify(body));
  }

  private sendError(res: Response, status: number, message: string) {
    const body: ErrorBody = { error: message };
    return this.send(res, status, body);
  }

  @Options('promptConfig')
  @HttpCode(204)
  async options(@Req() req: Request, @Res() res: Response) {
    const traceId = this.getTraceId(req);
    res.set(CORS_HEADERS);
    res.setHeader('X-Trace-Id', traceId);
    return res.send('');
  }

  @Get('promptConfig')
  async get(@Req() req: Request, @Res() res: Response) {
    const traceId = this.getTraceId(req);
    this.setup(res, traceId);

    try {
      const out = await this.svc.handleGet(req);
      return this.send(res, 200, out);
    } catch (e: any) {
      const status = typeof e?.status === 'number' ? e.status : 500;
      const msg =
        typeof e?.message === 'string' && e.message.trim() ? e.message : 'Internal server error';
      return this.sendError(res, status, msg);
    }
  }

  @Post('promptConfig')
  async post(@Req() req: Request, @Res() res: Response) {
    const traceId = this.getTraceId(req);
    this.setup(res, traceId);

    try {
      const out = await this.svc.handlePost(req.body);
      return this.send(res, 201, out);
    } catch (e: any) {
      const status = typeof e?.status === 'number' ? e.status : 500;
      const msg =
        typeof e?.message === 'string' && e.message.trim() ? e.message : 'Internal server error';
      return this.sendError(res, status, msg);
    }
  }

  @Put('promptConfig')
  async put(@Req() req: Request, @Res() res: Response) {
    const traceId = this.getTraceId(req);
    this.setup(res, traceId);

    try {
      const out = await this.svc.handleUpdate(req);
      return this.send(res, 200, out);
    } catch (e: any) {
      const status = typeof e?.status === 'number' ? e.status : 500;
      const msg =
        typeof e?.message === 'string' && e.message.trim() ? e.message : 'Internal server error';
      return this.sendError(res, status, msg);
    }
  }

  @Patch('promptConfig')
  async patch(@Req() req: Request, @Res() res: Response) {
    const traceId = this.getTraceId(req);
    this.setup(res, traceId);

    try {
      const out = await this.svc.handleUpdate(req);
      return this.send(res, 200, out);
    } catch (e: any) {
      const status = typeof e?.status === 'number' ? e.status : 500;
      const msg =
        typeof e?.message === 'string' && e.message.trim() ? e.message : 'Internal server error';
      return this.sendError(res, status, msg);
    }
  }

  @Delete('promptConfig')
  async del(@Req() req: Request, @Res() res: Response) {
    const traceId = this.getTraceId(req);
    this.setup(res, traceId);

    try {
      const out = await this.svc.handleDelete(req);
      return this.send(res, 200, out);
    } catch (e: any) {
      const status = typeof e?.status === 'number' ? e.status : 500;
      const msg =
        typeof e?.message === 'string' && e.message.trim() ? e.message : 'Internal server error';
      return this.sendError(res, status, msg);
    }
  }
}
