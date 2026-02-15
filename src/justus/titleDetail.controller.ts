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

function hasRequiredTitleYear(info: TitleDetailInfo) {
  return Boolean(String(info.title || '').trim()) && Boolean(String(info.year || '').trim());
}

function hasAnyInfoValue(info: TitleDetailInfo) {
  return Boolean(
    String(info.title || '').trim() ||
      String(info.year || '').trim() ||
      String(info.rated || '').trim() ||
      String(info.released || '').trim() ||
      String(info.runtime || '').trim() ||
      String(info.genre || '').trim() ||
      String(info.director || '').trim() ||
      String(info.writers || '').trim() ||
      String(info.actors || '').trim() ||
      String(info.plot || '').trim() ||
      String(info.language || '').trim() ||
      String(info.country || '').trim() ||
      String(info.poster || '').trim(),
  );
}

function toTitleDetailInfoFromFallback(raw: any, imdbId: string): TitleDetailInfo {
  const runtimeRaw = cleanText(raw?.runtime);
  const runtime = /^\d+$/.test(runtimeRaw) ? runtimeRaw : parseRuntimeMinutes(runtimeRaw);

  return {
    title: cleanText(raw?.title),
    year: cleanText(raw?.year),
    rated: cleanText(raw?.rated),
    released: cleanText(raw?.released),
    runtime,
    genre: cleanText(raw?.genre),
    director: cleanText(raw?.director),
    writers: cleanText(raw?.writers),
    actors: cleanText(raw?.actors),
    plot: cleanText(raw?.plot),
    language: cleanText(raw?.language),
    country: cleanText(raw?.country),
    poster: cleanText(raw?.poster),
    imdbId: cleanText(raw?.imdbId) || imdbId,
  };
}

function buildLocalBaseUrl(req: Request) {
  const proto =
    (req.header('x-forwarded-proto') || '').split(',')[0]?.trim() || req.protocol || 'http';
  const host =
    (req.header('x-forwarded-host') || '').split(',')[0]?.trim() ||
    req.get('host') ||
    req.headers.host ||
    '';
  return host ? `${proto}://${host}` : '';
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

    const apiKey = process.env.OMDB_API_KEY;
    const omdbErrors: any[] = [];
    let omdbInfo = baseInfo;
    let omdbStatus = 502;
    let shouldFallback = false;

    if (!apiKey) {
      shouldFallback = true;
      omdbErrors.push(
        makeError({
          source: 'config',
          message: 'Missing OMDB_API_KEY',
          code: 'MISSING_OMDB_API_KEY',
        }),
      );
    } else {
      const omdbParams = new URLSearchParams({ apikey: apiKey, i: imdbId });
      const omdbUrl = `http://www.omdbapi.com/?${omdbParams.toString()}`;

      try {
        const upstream = await fetch(omdbUrl, {
          method: 'GET',
          headers: { 'x-trace-id': traceId },
        });

        omdbStatus = upstream.status;
        const raw = await upstream.text().catch(() => '');
        let parsed: any = {};

        try {
          parsed = raw ? JSON.parse(raw) : {};
        } catch (err) {
          shouldFallback = true;
          omdbErrors.push(
            makeError({
              source: 'omdb',
              message: `OMDb JSON parse failed: ${extractErrMessage(err)}`,
              code: 'OMDB_JSON_PARSE_FAILED',
              details: { bodySnippet: truncate(raw) },
            }),
          );
        }

        if (!upstream.ok) {
          shouldFallback = true;
          omdbErrors.push(
            makeError({
              source: 'omdb',
              message: `OMDb HTTP ${upstream.status} ${upstream.statusText || ''}`.trim(),
              code: upstream.status,
              details: { bodySnippet: truncate(raw) },
            }),
          );
        } else if (String(parsed?.Response || '').toLowerCase() === 'false') {
          shouldFallback = true;
          omdbErrors.push(
            makeError({
              source: 'omdb',
              message: String(parsed?.Error || 'Title not found'),
              code: 'OMDB_NO_RESULTS',
            }),
          );
        } else {
          omdbInfo = toTitleDetailInfo(parsed, imdbId);
          if (!hasRequiredTitleYear(omdbInfo)) {
            shouldFallback = true;
            omdbErrors.push(
              makeError({
                source: 'omdb',
                message: 'OMDb missing required fields: title/year',
                code: 'OMDB_MISSING_REQUIRED_FIELDS',
                details: {
                  missingFields: [
                    ...(!String(omdbInfo.title || '').trim() ? ['title'] : []),
                    ...(!String(omdbInfo.year || '').trim() ? ['year'] : []),
                  ],
                },
              }),
            );
          }
        }
      } catch (err) {
        shouldFallback = true;
        omdbErrors.push(
          makeError({
            source: 'omdb',
            message: `OMDb fetch failed: ${extractErrMessage(err)}`,
            code: 'OMDB_FETCH_FAILED',
            details: { error: stringifyError(err), omdbUrl },
          }),
        );
      }
    }

    if (!shouldFallback) {
      const statusCode = hasPartialInfo(omdbInfo) ? 206 : 200;
      const body = {
        requestId: traceId,
        statusCode,
        dataSource: 'imdb',
        imdbId,
        info: omdbInfo,
        errors: [],
        traceId,
      };

      res.setHeader('x-trace-id', traceId);
      return res
        .status(statusCode)
        .set({ ...JSON_HEADERS, ...CORS_HEADERS })
        .send(JSON.stringify(body));
    }

    // Fallback: /api/parse/imdbDetail?imdbId=...
    const base = buildLocalBaseUrl(req);
    const fallbackErrors: any[] = [];
    let fallbackInfo = baseInfo;
    let fallbackStatus = 502;

    if (!base) {
      fallbackErrors.push(
        makeError({
          source: 'imdbDetailFallback',
          message: 'Cannot resolve local base URL for fallback',
          code: 'FALLBACK_BASE_URL_UNRESOLVED',
        }),
      );
    } else {
      const fallbackUrl = `${base.replace(/\/$/, '')}/api/parse/imdbDetail?imdbId=${encodeURIComponent(imdbId)}`;
      const authHeader = req.header('authorization') || req.header('Authorization');

      try {
        const fallbackResp = await fetch(fallbackUrl, {
          method: 'GET',
          headers: {
            ...(authHeader ? { authorization: authHeader } : {}),
            'x-trace-id': traceId,
          },
        });

        fallbackStatus = fallbackResp.status;
        const raw = await fallbackResp.text().catch(() => '');
        let parsed: any = {};

        try {
          parsed = raw ? JSON.parse(raw) : {};
        } catch (err) {
          fallbackErrors.push(
            makeError({
              source: 'imdbDetailFallback',
              message: `Fallback JSON parse failed: ${extractErrMessage(err)}`,
              code: 'FALLBACK_JSON_PARSE_FAILED',
              details: { bodySnippet: truncate(raw), fallbackUrl },
            }),
          );
        }

        if (!fallbackResp.ok) {
          fallbackErrors.push(
            makeError({
              source: 'imdbDetailFallback',
              message: `Fallback HTTP ${fallbackResp.status} ${fallbackResp.statusText || ''}`.trim(),
              code: fallbackResp.status,
              details: { bodySnippet: truncate(raw), fallbackUrl },
            }),
          );
        }

        if (parsed?.info && typeof parsed.info === 'object') {
          fallbackInfo = toTitleDetailInfoFromFallback(parsed.info, imdbId);
        }

        if (Array.isArray(parsed?.errors) && parsed.errors.length > 0) {
          fallbackErrors.push(
            ...parsed.errors.map((msg: any) =>
              makeError({
                source: 'imdbDetailFallback',
                message: String(msg),
                code: 'FALLBACK_PARTIAL',
              }),
            ),
          );
        }
      } catch (err) {
        fallbackErrors.push(
          makeError({
            source: 'imdbDetailFallback',
            message: `Fallback fetch failed: ${extractErrMessage(err)}`,
            code: 'FALLBACK_FETCH_FAILED',
            details: { error: stringifyError(err), fallbackUrl },
          }),
        );
      }
    }

    if (hasRequiredTitleYear(fallbackInfo)) {
      const statusCode = hasPartialInfo(fallbackInfo) ? 206 : 200;
      const body = {
        requestId: traceId,
        statusCode,
        dataSource: 'imdb',
        imdbId,
        info: fallbackInfo,
        errors: statusCode === 206 ? fallbackErrors : [],
        traceId,
      };

      res.setHeader('x-trace-id', traceId);
      return res
        .status(statusCode)
        .set({ ...JSON_HEADERS, ...CORS_HEADERS })
        .send(JSON.stringify(body));
    }

    const fallbackFailedStatus = hasAnyInfoValue(omdbInfo) ? 206 : omdbStatus >= 400 ? omdbStatus : 502;
    const fallbackFailedInfo = hasAnyInfoValue(omdbInfo) ? omdbInfo : baseInfo;
    const body = {
      requestId: traceId,
      statusCode: fallbackFailedStatus,
      dataSource: 'imdb',
      imdbId,
      info: fallbackFailedInfo,
      errors: [...omdbErrors, ...fallbackErrors],
      traceId,
    };

    res.setHeader('x-trace-id', traceId);
    return res
      .status(fallbackFailedStatus)
      .set({ ...JSON_HEADERS, ...CORS_HEADERS })
      .send(JSON.stringify(body));
  }
}
