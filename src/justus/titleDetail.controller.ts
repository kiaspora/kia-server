import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { BearerTokenGuard } from '../auth/bearer-token.guard';

const JSON_HEADERS = { 'content-type': 'application/json' };
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,OPTIONS',
  'access-control-allow-headers': 'content-type, authorization, x-trace-id',
};

type TitleDetailInfo = {
  title: string;
  year: string;
  rated: string;
  released: string;
  runtime: string;
  genre: string;
  director: string;
  writers: string;
  actors: string;
  plot: string;
  language: string;
  country: string;
  poster: string;
  imdbId: string;
};

function makeError({
  source,
  message,
  code,
  details,
}: {
  source: string;
  message: string;
  code?: any;
  details?: any;
}) {
  const out: any = { source, message };
  if (code !== undefined && code !== null) out.code = code;
  if (details !== undefined && details !== null) out.details = details;
  return out;
}

function truncate(s: any, n = 800) {
  if (typeof s !== 'string') return s;
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

function extractErrMessage(err: any) {
  if (!err) return 'unknown error';
  if (typeof err.message === 'string' && err.message.trim()) return err.message;
  return String(err);
}

function stringifyError(err: any) {
  try {
    return {
      message: err?.message ? String(err.message) : String(err),
      name: err?.name ?? null,
      stack: err?.stack ?? null,
      cause: err?.cause ? stringifyError(err.cause) : null,
    };
  } catch {
    return { message: String(err) };
  }
}

function cleanText(value: any): string {
  const text = String(value ?? '').trim();
  return text === 'N/A' ? '' : text;
}

function parseRuntimeMinutes(runtime: any): string {
  const text = cleanText(runtime);
  if (!text) return '';
  const m = text.match(/(\d+)\s*min/i);
  return m ? m[1] : '';
}

function firstCommaValue(value: any): string {
  const text = cleanText(value);
  if (!text) return '';
  const first = text.split(',')[0];
  return String(first ?? '').trim();
}

function toTitleDetailInfo(omdb: any, imdbId: string): TitleDetailInfo {
  const resolvedImdbId = cleanText(omdb?.imdbID) || imdbId;
  return {
    title: cleanText(omdb?.Title),
    year: cleanText(omdb?.Year),
    rated: cleanText(omdb?.Rated),
    released: cleanText(omdb?.Released),
    runtime: parseRuntimeMinutes(omdb?.Runtime),
    genre: cleanText(omdb?.Genre),
    director: cleanText(omdb?.Director),
    writers: cleanText(omdb?.Writer),
    actors: cleanText(omdb?.Actors),
    plot: cleanText(omdb?.Plot),
    language: firstCommaValue(omdb?.Language),
    country: firstCommaValue(omdb?.Country),
    poster: cleanText(omdb?.Poster),
    imdbId: resolvedImdbId,
  };
}

function hasPartialInfo(info: TitleDetailInfo) {
  return Object.values(info).some((v) => !String(v || '').trim());
}

@Controller('api/justus')
@UseGuards(BearerTokenGuard)
export class TitleDetailController {
  @Get('titleDetail')
  async titleDetail(
    @Req() req: Request,
    @Res() res: Response,
    @Query('imdbId') imdbIdRaw: string | undefined,
  ) {
    const traceId =
      (req.header('x-trace-id') || req.header('X-Trace-Id'))?.trim() || randomUUID();

    const imdbId = String(imdbIdRaw ?? '').trim();
    const baseInfo: TitleDetailInfo = {
      title: '',
      year: '',
      rated: '',
      released: '',
      runtime: '',
      genre: '',
      director: '',
      writers: '',
      actors: '',
      plot: '',
      language: '',
      country: '',
      poster: '',
      imdbId,
    };

    const errors: any[] = [];
    const apiKey = process.env.OMDB_API_KEY;

    if (!apiKey) {
      const body = {
        requestId: traceId,
        statusCode: 500,
        dataSource: 'imdb',
        imdbId,
        info: baseInfo,
        errors: [
          makeError({
            source: 'config',
            message: 'Missing OMDB_API_KEY',
            code: 'MISSING_OMDB_API_KEY',
          }),
        ],
        traceId,
      };

      res.setHeader('x-trace-id', traceId);
      return res
        .status(500)
        .set({ ...JSON_HEADERS, ...CORS_HEADERS })
        .send(JSON.stringify(body));
    }

    if (!/^tt\d+$/.test(imdbId)) {
      const body = {
        requestId: traceId,
        statusCode: 400,
        dataSource: 'imdb',
        imdbId,
        info: baseInfo,
        errors: [
          makeError({
            source: 'input',
            message: 'Invalid imdbId (expected tt123...)',
            code: 'INVALID_IMDB_ID',
          }),
        ],
        traceId,
      };

      res.setHeader('x-trace-id', traceId);
      return res
        .status(400)
        .set({ ...JSON_HEADERS, ...CORS_HEADERS })
        .send(JSON.stringify(body));
    }

    const omdbParams = new URLSearchParams({ apikey: apiKey, i: imdbId });
    const omdbUrl = `http://www.omdbapi.com/?${omdbParams.toString()}`;

    try {
      const upstream = await fetch(omdbUrl, {
        method: 'GET',
        headers: { 'x-trace-id': traceId },
      });

      const raw = await upstream.text().catch(() => '');
      let parsed: any = {};

      try {
        parsed = raw ? JSON.parse(raw) : {};
      } catch (err) {
        errors.push(
          makeError({
            source: 'omdb',
            message: `OMDb JSON parse failed: ${extractErrMessage(err)}`,
            code: 'OMDB_JSON_PARSE_FAILED',
            details: { bodySnippet: truncate(raw) },
          }),
        );
      }

      if (!upstream.ok) {
        errors.push(
          makeError({
            source: 'omdb',
            message: `OMDb HTTP ${upstream.status} ${upstream.statusText || ''}`.trim(),
            code: upstream.status,
            details: { bodySnippet: truncate(raw) },
          }),
        );
      } else if (String(parsed?.Response || '').toLowerCase() === 'false') {
        errors.push(
          makeError({
            source: 'omdb',
            message: String(parsed?.Error || 'Title not found'),
            code: 'OMDB_NO_RESULTS',
          }),
        );
      }

      const hasHardErrors = errors.length > 0;
      if (hasHardErrors) {
        const failureStatus = !upstream.ok ? upstream.status : 404;
        const body = {
          requestId: traceId,
          statusCode: failureStatus,
          dataSource: 'imdb',
          imdbId,
          info: baseInfo,
          errors,
          traceId,
        };

        res.setHeader('x-trace-id', traceId);
        return res
          .status(failureStatus)
          .set({ ...JSON_HEADERS, ...CORS_HEADERS })
          .send(JSON.stringify(body));
      }

      const info = toTitleDetailInfo(parsed, imdbId);
      const statusCode = hasPartialInfo(info) ? 206 : 200;

      const body = {
        requestId: traceId,
        statusCode,
        dataSource: 'imdb',
        imdbId,
        info,
        errors: [],
        traceId,
      };

      res.setHeader('x-trace-id', traceId);
      return res
        .status(statusCode)
        .set({ ...JSON_HEADERS, ...CORS_HEADERS })
        .send(JSON.stringify(body));
    } catch (err) {
      const body = {
        requestId: traceId,
        statusCode: 502,
        dataSource: 'imdb',
        imdbId,
        info: baseInfo,
        errors: [
          makeError({
            source: 'omdb',
            message: `OMDb fetch failed: ${extractErrMessage(err)}`,
            code: 'OMDB_FETCH_FAILED',
            details: { error: stringifyError(err) },
          }),
        ],
        traceId,
      };

      res.setHeader('x-trace-id', traceId);
      return res
        .status(502)
        .set({ ...JSON_HEADERS, ...CORS_HEADERS })
        .send(JSON.stringify(body));
    }
  }
}
