import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { BearerTokenGuard } from '../auth/bearer-token.guard';
import type { Request } from 'express';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

type TraceRequest = Request & { traceId?: string };

type ParseHtmlResponse = {
  statusCode: number;
  url: string;
  filePath: string | null;
  errors: string[];
  latency: number;
  size: number;
};

type ImdbDetailBody = {
  requestId: string;
  statusCode: number;
  dataSource: 'imdb' | string;
  imdbId: string;
  info: any;
  errors: any[];
  traceId?: string;
};

type ApiResponse<T> = {
  statusCode: number;
  errors: string[];
  latency: number;
  size?: number;
  data: T;
  // traceId injected by interceptor
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
  // 500..1500 inclusive-ish
  return 500 + Math.floor(Math.random() * 1001);
}

function parseImdbIdsFromTrailerHtml(html: string): string[] {
  const patterns = [
    /href=['"]\/title\/(tt\d+)\b/gi,
    /\/title\/(tt\d+)\b/gi,
  ];

  const out: string[] = [];
  const seen = new Set<string>();

  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const id = m[1];
      if (!seen.has(id)) {
        seen.add(id);
        out.push(id);
        if (out.length >= 40) return out;
      }
    }
  }

  return out;
}

function looksBlockedOrConsent(html: string) {
  const s = html.toLowerCase();
  return (
    s.includes('consent') ||
    s.includes('captcha') ||
    s.includes('robot check') ||
    s.includes('verify you are human')
  );
}

@UseGuards(BearerTokenGuard)
@Controller('api/justus')
export class TrailersController {
  @Get('trailers')
  async trailers(@Query('limit') limitRaw: string | undefined, @Req() req: TraceRequest): Promise<ApiResponse<{
    sourceUrl: string;
    limit: number;
    candidateCount: number;
    writtenCount: number;
    outputFile: string;
    items: ImdbDetailBody[];
  } | null>> {
    const started = Date.now();
    const limit = parseLimit(limitRaw);
    const sourceUrl = 'https://www.imdb.com/trailers';

    const auth = (req.headers?.authorization ?? (req.headers as any)?.Authorization) as string | undefined;

    const proto =
      (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim() ||
      (req as any).protocol ||
      'http';

    const host =
      (req.headers['x-forwarded-host'] as string | undefined)?.split(',')[0]?.trim() ||
      (req as any).get?.('host');

    const base = `${proto}://${host}`;

    // 1) Call /api/parse/html?url=https://www.imdb.com/trailers
    const localParseUrl = `${base}/api/parse/html?url=${encodeURIComponent(sourceUrl)}`;

    let parseResp: ParseHtmlResponse;
    try {
      const r = await fetch(localParseUrl, {
        redirect: 'follow',
        headers: {
          ...(auth ? { Authorization: auth } : {}),
          ...(req.traceId ? { 'x-trace-id': req.traceId } : {}),
        },
      });
      parseResp = (await r.json()) as ParseHtmlResponse;
    } catch (e: any) {
      return {
        statusCode: 500,
        errors: [e?.message ? String(e.message) : 'Failed to call /api/parse/html'],
        latency: Date.now() - started,
        data: null,
      };
    }

    if (!parseResp.filePath || (parseResp.errors?.length ?? 0) > 0) {
      return {
        statusCode: parseResp.statusCode || 500,
        errors: parseResp.errors?.length ? parseResp.errors : ['No filePath returned'],
        latency: Date.now() - started,
        data: null,
      };
    }

    // 2) Safety: only read from temp/
    if (!parseResp.filePath.startsWith('temp/')) {
      return {
        statusCode: 400,
        errors: ['Invalid filePath (must start with temp/)'],
        latency: Date.now() - started,
        data: null,
      };
    }

    // 3) Read HTML from disk + parse first 40 ids
    const absPath = path.join(process.cwd(), parseResp.filePath);
    let html: string;
    try {
      html = await fs.readFile(absPath, 'utf8');
    } catch (e: any) {
      return {
        statusCode: 500,
        errors: [e?.message ? String(e.message) : 'Failed to read HTML file'],
        latency: Date.now() - started,
        data: null,
      };
    }

    // best-effort cleanup
    fs.unlink(absPath).catch(() => void 0);

    console.log('[trailers] html bytes:', Buffer.byteLength(html, 'utf8'));
    console.log('[trailers] contains "/title/tt"?', html.includes('/title/tt'));

    if (looksBlockedOrConsent(html)) {
      return {
        statusCode: 502,
        errors: ['IMDB returned a consent/captcha page; no titles to parse'],
        latency: Date.now() - started,
        data: null,
      };
    }

    const candidates = parseImdbIdsFromTrailerHtml(html);
    const targetIds = candidates.slice(0, limit);

    // 4) Call /api/parse/imdbDetail sequentially w/ delay, keep only successful
    const items: ImdbDetailBody[] = [];
    for (let i = 0; i < targetIds.length; i++) {
      const imdbId = targetIds[i];

      const detailUrl = `${base}/api/parse/imdbDetail?imdbId=${encodeURIComponent(imdbId)}`;

      try {
        const r = await fetch(detailUrl, {
          redirect: 'follow',
          headers: {
            ...(auth ? { Authorization: auth } : {}),
            ...(req.traceId ? { 'x-trace-id': req.traceId } : {}),
          },
        });

        const body = (await r.json()) as ImdbDetailBody;

        const hasErrors = Array.isArray(body?.errors) && body.errors.length > 0;
        if (body?.statusCode === 200 && !hasErrors) {
          items.push(body);
        }
      } catch {
        // swallow per requirement: don't add items to JSON if error returned
      }

      if (i < targetIds.length - 1) {
        await sleep(randomDelayMs());
      }
    }

    if (items.length === 0) {
      return {
        statusCode: 200,
        errors: ['No items parsed; calendarItems.json not updated'],
        latency: Date.now() - started,
        size: 0,
        data: {
          sourceUrl,
          limit,
          candidateCount: candidates.length,
          writtenCount: 0,
          outputFile: 'public/calendarItems.json',
          items: [],
        },
      };
    }

    // 5) Write public/calendarItems.json (atomic)
    const outRel = 'public/calendarItems.json';
    const outAbs = path.join(process.cwd(), outRel);
    const tmpAbs = `${outAbs}.tmp`;

    await fs.mkdir(path.dirname(outAbs), { recursive: true });
    await fs.writeFile(tmpAbs, JSON.stringify(items, null, 2), 'utf8');
    await fs.rename(tmpAbs, outAbs);

    return {
      statusCode: 200,
      errors: [],
      latency: Date.now() - started,
      size: items.length,
      data: {
        sourceUrl,
        limit,
        candidateCount: candidates.length,
        writtenCount: items.length,
        outputFile: outRel,
        items,
      },
    };
  }
}
