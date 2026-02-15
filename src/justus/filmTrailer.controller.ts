import { All, Controller, Get, Options, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { FilmTrailerService } from './filmTrailer.service';

const JSON_HEADERS = { 'content-type': 'application/json' };
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,OPTIONS',
  'access-control-allow-headers': 'content-type, authorization, x-trace-id',
};

@Controller('api/justus')
export class FilmTrailerController {
  constructor(private readonly filmTrailerService: FilmTrailerService) {}

  @Options('filmTrailer')
  options(@Req() req: Request, @Res() res: Response) {
    const traceId = this.resolveTraceId(req);
    res.setHeader('X-Trace-Id', traceId);
    return res.status(204).set({ ...CORS_HEADERS, Allow: 'GET, OPTIONS' }).send();
  }

  @Get('filmTrailer')
  async filmTrailer(
    @Req() req: Request,
    @Res() res: Response,
    @Query() queryParams: Record<string, string | string[] | undefined>,
  ) {
    const traceId = this.resolveTraceId(req);

    if (!this.isAuthorized(req)) {
      const body = {
        requestId: traceId,
        statusCode: 401,
        dataSource: 'youtube',
        videos: [],
        videoCount: 0,
        errors: ['Unauthorized'],
      };

      res.setHeader('X-Trace-Id', traceId);
      return res.status(401).set({ ...JSON_HEADERS, ...CORS_HEADERS }).send(JSON.stringify(body));
    }

    const result = await this.filmTrailerService.search(traceId, queryParams);

    res.setHeader('X-Trace-Id', traceId);
    return res
      .status(result.statusCode)
      .set({ ...JSON_HEADERS, ...CORS_HEADERS })
      .send(JSON.stringify(result.body));
  }

  @All('filmTrailer')
  methodNotAllowed(@Req() req: Request, @Res() res: Response) {
    const traceId = this.resolveTraceId(req);
    const body = {
      requestId: traceId,
      statusCode: 405,
      dataSource: 'youtube',
      videos: [],
      videoCount: 0,
      errors: ['Method not allowed'],
    };

    res.setHeader('X-Trace-Id', traceId);
    return res
      .status(405)
      .set({ ...JSON_HEADERS, ...CORS_HEADERS, Allow: 'GET, OPTIONS' })
      .send(JSON.stringify(body));
  }

  private resolveTraceId(req: Request): string {
    return (req.header('x-trace-id') || req.header('X-Trace-Id') || '').trim() || randomUUID();
  }

  private isAuthorized(req: Request): boolean {
    const expected = process.env.API_BEARER_TOKEN ?? '';
    const auth = req.header('authorization') || req.header('Authorization') || '';

    if (!expected || !auth.startsWith('Bearer ')) return false;

    const suppliedToken = auth.slice('Bearer '.length).trim();
    return suppliedToken === expected;
  }
}
