// src/justus/trailers.controller.ts
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { BearerTokenGuard } from '../auth/bearer-token.guard';
import type { Request } from 'express';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

type TraceRequest = Request & { traceId?: string };

type TitleDetailBody = {
  requestId: string;
  statusCode: number; // 200 | 206 etc
  dataSource: 'imdb' | string;
  imdbId: string;
  info: any;
  errors: any[];
  traceId?: string;
  timestamp?: string;
};

type ApiResponse<T> = {
  statusCode: number;
  errors: string[];
  latency: number;
  size?: number;
  data: T;
};

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function parseLimit(raw: any) {
  const n = Number(String(raw ?? '').trim() || '10');
  if (!Number.isFinite(n)) return 10;
  return clampInt(Math.floor(n), 1, 40);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function randomDelayMs() {
  // 500..1500
  return 500 + Math.floor(Math.random() * 1001);
}

function isValidImdbId(s: unknown): s is string {
  return typeof s === 'string' && /^tt\d{5,12}$/.test(s);
}

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

function log(traceId: string | undefined, ...args: any[]) {
  const prefix = traceId ? `[trailers][${traceId}]` : `[trailers]`;
  // eslint-disable-next-line no-console
  console.log(prefix, ...args);
}

@UseGuards(BearerTokenGuard)
@Controller('api/justus')
export class TrailersController {
  @Get('trailers')
  async trailers(
    @Query('limit') limitRaw: string | undefined,
    @Req() req: TraceRequest,
  ): Promise<
    ApiResponse<{
      inputFile: string;
      outputFile: string;
      limit: number;
      candidateCount: number;
      requestedCount: number;
      writtenCount: number;
      items: TitleDetailBody[];
    } | null>
  > {
    const started = Date.now();
    const limit = parseLimit(limitRaw);
    const traceId = req.traceId;

    log(traceId, 'START', { limit });

    const auth = (req.headers?.authorization ?? (req.headers as any)?.Authorization) as string | undefined;

    const proto =
      (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim() ||
      (req as any).protocol ||
      'http';

    const host =
      (req.headers['x-forwarded-host'] as string | undefined)?.split(',')[0]?.trim() ||
      (req as any).get?.('host');

    const base = `${proto}://${host}`;
    log(traceId, 'BASE', base);

    // 1) Read public/trailer_ids.json
    const inRel = 'public/trailer_ids.json';
    const inAbs = path.join(process.cwd(), inRel);

    type TrailerIdRow = { imdb_id?: unknown; imdbId?: unknown; id?: unknown } | string;

    let rawJson: unknown;
    try {
      log(traceId, 'READ input', inRel, '=>', inAbs);
      const raw = await fs.readFile(inAbs, 'utf8');
      rawJson = JSON.parse(raw);
    } catch (e: any) {
      log(traceId, 'READ/PARSE FAIL', e?.message || e);
      return {
        statusCode: 500,
        errors: [e?.message ? String(e.message) : `Failed to read/parse ${inRel}`],
        latency: Date.now() - started,
        data: null,
      };
    }

    if (!Array.isArray(rawJson)) {
      return {
        statusCode: 400,
        errors: [`${inRel} must be a JSON array`],
        latency: Date.now() - started,
        data: null,
      };
    }

    const extracted = rawJson
      .map((row: TrailerIdRow) => {
        if (typeof row === 'string') return row;
        if (row && typeof row === 'object') {
          const r = row as any;
          return (r.imdb_id ?? r.imdbId ?? r.id) as unknown;
        }
        return undefined;
      })
      .filter(isValidImdbId);

    const candidates = uniq(extracted);

    if (candidates.length === 0) {
      return {
        statusCode: 400,
        errors: [`No valid IMDb ids found in ${inRel}`],
        latency: Date.now() - started,
        data: null,
      };
    }

    // ✅ limit enforced here
    const targetIds = candidates.slice(0, limit);
    log(traceId, 'TARGETS', { requestedCount: targetIds.length, targetIds });

    // 2) Call /api/justus/titleDetail sequentially with 500..1500ms delay
    const items: TitleDetailBody[] = [];

    for (let i = 0; i < targetIds.length; i++) {
      const imdbId = targetIds[i];

      // ✅ CORRECT ENDPOINT
      const detailUrl = `${base}/api/justus/titleDetail?imdbId=${encodeURIComponent(imdbId)}`;

      const t0 = Date.now();
      log(traceId, `DETAIL ${i + 1}/${targetIds.length} -> FETCH start`, { imdbId });

      try {
        const ac = new AbortController();
        const timeoutMs = 20_000;
        const timer = setTimeout(() => ac.abort(), timeoutMs);

        const r = await fetch(detailUrl, {
          redirect: 'follow',
          signal: ac.signal,
          headers: {
            ...(auth ? { Authorization: auth } : {}),
            ...(traceId ? { 'x-trace-id': traceId } : {}),
          },
        }).finally(() => clearTimeout(timer));

        const httpStatus = r.status;
        const body = (await r.json()) as TitleDetailBody;

        const ms = Date.now() - t0;
        const hasErrors = Array.isArray(body?.errors) && body.errors.length > 0;

        // titleDetail often returns 206; treat 200/206 as success
        const ok = (body?.statusCode === 200 || body?.statusCode === 206) && !hasErrors;

        log(traceId, `DETAIL ${i + 1}/${targetIds.length} <- FETCH done`, {
          imdbId,
          httpStatus,
          bodyStatusCode: body?.statusCode,
          ok,
          ms,
        });

        if (ok) items.push(body);
      } catch (e: any) {
        const ms = Date.now() - t0;
        log(traceId, `DETAIL ${i + 1}/${targetIds.length} FAIL`, {
          imdbId,
          ms,
          err: e?.name === 'AbortError' ? 'AbortError (timeout)' : e?.message || String(e),
        });
      }

      if (i < targetIds.length - 1) {
        const d = randomDelayMs();
        log(traceId, `DELAY ${i + 1}/${targetIds.length}`, { ms: d });
        await sleep(d);
      }
    }

    // 3) Write public/trailers_list.json (atomic)
    const outRel = 'public/trailers_list.json';
    const outAbs = path.join(process.cwd(), outRel);
    const tmpAbs = `${outAbs}.tmp`;

    await fs.mkdir(path.dirname(outAbs), { recursive: true });
    await fs.writeFile(tmpAbs, JSON.stringify(items, null, 2), 'utf8');
    await fs.rename(tmpAbs, outAbs);

    const latency = Date.now() - started;
    log(traceId, 'DONE', { requestedCount: targetIds.length, writtenCount: items.length, latencyMs: latency });

    return {
      statusCode: 200,
      errors: items.length ? [] : ['No items parsed; trailers_list.json written as empty array'],
      latency,
      size: items.length,
      data: {
        inputFile: inRel,
        outputFile: outRel,
        limit,
        candidateCount: candidates.length,
        requestedCount: targetIds.length,
        writtenCount: items.length,
        items,
      },
    };
  }
}