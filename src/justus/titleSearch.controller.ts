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

function toCamelKey(key: string) {
  return String(key)
    .replace(/^[A-Z]/, (m) => m.toLowerCase())
    .replace(/[_-\s]+([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
}

function camelizeValue(value: any): any {
  if (Array.isArray(value)) return value.map(camelizeValue);
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const out: any = {};
    for (const [k, v] of Object.entries(value)) out[toCamelKey(k)] = camelizeValue(v);
    return out;
  }
  return value;
}

function normalizeItemsToCamel(items: any): any[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return item;
    return camelizeValue(item);
  });
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

@Controller('api/justus')
@UseGuards(BearerTokenGuard)
export class TitleSearchController {
  @Get('titleSearch')
  async titleSearch(@Req() req: Request, @Res() res: Response, @Query() _qp: any) {
    const traceId =
      (req.header('x-trace-id') || req.header('X-Trace-Id'))?.trim() || randomUUID();

    const base = process.env.CF_WORKER_BASE_URL;
    if (!base) {
      const body = {
        requestId: traceId,
        statusCode: 500,
        dataSource: 'imdb',
        items: [],
        itemCount: 0,
        pageLimit: 0,
        errors: [
          makeError({
            source: 'config',
            message: 'Missing CF_WORKER_BASE_URL',
            code: 'MISSING_CF_WORKER_BASE_URL',
          }),
        ],
      };

      res.setHeader('x-trace-id', traceId);
      return res
        .status(500)
        .set({ ...JSON_HEADERS, ...CORS_HEADERS })
        .send(JSON.stringify(body));
    }

    // Parse query string similar to Netlify event.rawQuery
    const qs = req.url.split('?')[1] ?? '';
    const params = new URLSearchParams(qs);

    // Forward everything except dataSource
    const upstreamParams = new URLSearchParams(params);
    upstreamParams.delete('dataSource');

    const pageLimit = parseInt(params.get('limit') || '20', 10);
    const omdbQuery = params.get('q') || params.get('query') || params.get('s') || '';
    const omdbPageRaw = parseInt(params.get('page') || '', 10);

    const targetUrl =
      `${base.replace(/\/$/, '')}/search/title` +
      (upstreamParams.toString() ? `?${upstreamParams.toString()}` : '');

    const errors: any[] = [];
    let items: any[] = [];
    let upstreamStatus = 200;
    let dataSource: 'imdb' | 'omdb' = 'imdb';
    let upstreamDebug: any = null;

    async function fetchOmdbFallback() {
      const apiKey = process.env.OMDB_API_KEY;

      if (!apiKey) {
        return {
          ok: false,
          status: 500,
          error: makeError({
            source: 'omdb',
            message: 'Missing OMDB_API_KEY',
            code: 'MISSING_OMDB_API_KEY',
          }),
        };
      }

      if (!String(omdbQuery).trim()) {
        return {
          ok: false,
          status: 400,
          error: makeError({
            source: 'omdb',
            message: 'Missing search query for OMDb fallback',
            code: 'MISSING_OMDB_QUERY',
          }),
        };
      }

      const omdbParams = new URLSearchParams({
        apikey: apiKey,
        s: String(omdbQuery).trim(),
      });

      if (Number.isInteger(omdbPageRaw) && omdbPageRaw > 0) {
        omdbParams.set('page', String(omdbPageRaw));
      }

      const omdbUrl = `http://www.omdbapi.com/?${omdbParams.toString()}`;

      try {
        const resp = await fetch(omdbUrl, {
          method: 'GET',
          headers: { 'x-trace-id': traceId },
        });

        const text = await resp.text().catch(() => '');
        let parsed: any = {};

        try {
          parsed = text ? JSON.parse(text) : {};
        } catch (e) {
          return {
            ok: false,
            status: 502,
            error: makeError({
              source: 'omdb',
              message: `OMDb JSON parse failed: ${extractErrMessage(e)}`,
              code: 'OMDB_JSON_PARSE_FAILED',
              details: { bodySnippet: truncate(text), omdbUrl },
            }),
          };
        }

        if (!resp.ok) {
          return {
            ok: false,
            status: resp.status,
            error: makeError({
              source: 'omdb',
              message: `OMDb HTTP ${resp.status} ${resp.statusText || ''}`.trim(),
              code: resp.status,
              details: { omdbUrl, bodySnippet: truncate(text) },
            }),
          };
        }

        if (String(parsed?.Response || '').toLowerCase() === 'false') {
          return {
            ok: false,
            status: 404,
            error: makeError({
              source: 'omdb',
              message: String(parsed?.Error || 'OMDb returned no results'),
              code: 'OMDB_NO_RESULTS',
              details: { omdbUrl },
            }),
          };
        }

        const found = Array.isArray(parsed?.Search) ? parsed.Search : [];

        return {
          ok: true,
          status: 200,
          items: normalizeItemsToCamel(pageLimit > 0 ? found.slice(0, pageLimit) : found),
        };
      } catch (err) {
        return {
          ok: false,
          status: 502,
          error: makeError({
            source: 'omdb',
            message: `OMDb fetch failed: ${extractErrMessage(err)}`,
            code: 'OMDB_FETCH_FAILED',
            details: { error: stringifyError(err), omdbUrl },
          }),
        };
      }
    }

    // 1) Primary upstream: CF Worker IMDb search proxy
    try {
      const upstream = await fetch(targetUrl, {
        method: 'GET',
        headers: { 'x-trace-id': traceId },
      });

      upstreamStatus = upstream.status;

      const text = await upstream.text().catch(() => '');

      upstreamDebug = {
        targetUrl,
        status: upstream.status,
        statusText: upstream.statusText,
        contentType: upstream.headers?.get?.('content-type') || null,
        bodySnippet: truncate(text),
      };

      if (!upstream.ok) {
        errors.push(
          makeError({
            source: 'upstream',
            message: `Upstream HTTP ${upstream.status} ${upstream.statusText || ''}`.trim(),
            code: upstream.status,
            details: upstreamDebug,
          }),
        );
      } else {
        let parsed: any = [];
        try {
          parsed = text ? JSON.parse(text) : [];
        } catch (e) {
          errors.push(
            makeError({
              source: 'upstream',
              message: `Upstream JSON parse failed: ${extractErrMessage(e)}`,
              code: 'UPSTREAM_JSON_PARSE_FAILED',
              details: upstreamDebug,
            }),
          );
          parsed = [];
        }

        if (Array.isArray(parsed)) {
          items = normalizeItemsToCamel(parsed);
        } else {
          errors.push(
            makeError({
              source: 'upstream',
              message: 'Unexpected upstream response shape',
              code: 'UPSTREAM_UNEXPECTED_SHAPE',
              details: upstreamDebug,
            }),
          );
        }
      }
    } catch (err: any) {
      upstreamStatus = 500;
      const msg = extractErrMessage(err);

      upstreamDebug = {
        targetUrl,
        error: stringifyError(err),
        message: msg,
        name: err?.name || null,
        cause: err?.cause ? stringifyError(err.cause) : null,
        hasCFWorkerBaseUrl: Boolean(process.env.CF_WORKER_BASE_URL),
      };

      errors.push(
        makeError({
          source: 'upstream',
          message: `Upstream fetch failed: ${msg}`,
          code: 'UPSTREAM_FETCH_FAILED',
          details: upstreamDebug,
        }),
      );
    }

    // 2) Fallback: OMDb if upstream returns no items and query exists
    const shouldTryOmdbFallback =
      (!Array.isArray(items) || items.length === 0) && Boolean(String(omdbQuery).trim());

    if (shouldTryOmdbFallback) {
      const omdb = await fetchOmdbFallback();

      if (omdb.ok) {
        items = omdb.items || [];
        dataSource = 'omdb';
        upstreamStatus = 200;
        errors.length = 0;
      } else if (omdb.error) {
        errors.push(omdb.error);
      }
    }

    const finalStatus = Array.isArray(items) && items.length > 0 ? 200 : upstreamStatus;

    const responseBody = {
      requestId: traceId,
      statusCode: finalStatus,
      dataSource,
      items,
      itemCount: items.length,
      pageLimit,
      errors,
    };

    res.setHeader('x-trace-id', traceId);
    return res
      .status(finalStatus)
      .set({ ...JSON_HEADERS, ...CORS_HEADERS })
      .send(JSON.stringify(responseBody));
  }
}
