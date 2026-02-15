import { Controller, Get, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

type ParseHtmlResponse = {
  statusCode: number;
  url: string;
  filePath: string | null;
  errors: string[];
  latency: number;
  size: number;
};

type ImdbSearchItem = {
  imdbId: string;
  title: string;
  year: number;
};

type ImdbSearchResponse = {
  statusCode: number;
  query: string;
  url: string;
  filePath: string | null;
  errors: string[];
  latency: number;
  size: number;
  results: ImdbSearchItem[];
};

function minimalEntityDecode(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function parseImdbFindHtml(html: string): ImdbSearchItem[] {
  // Case-sensitive, dot matches newlines, global scan, lazy separators
  const re =
    /href="\/title\/(tt\d+)\/[^"]*"[^>]*>.*?<h3[^>]*class="ipc-title__text"[^>]*>(.*?)<\/h3>.*?<span[^>]*cli-title-metadata-item[^>]*>(\d{4})<\/span>/gs;

  const out: ImdbSearchItem[] = [];
  let m: RegExpExecArray | null;

  while ((m = re.exec(html)) !== null) {
    const imdbId = m[1];
    const titleRaw = m[2] ?? '';
    const yearRaw = m[3];

    out.push({
      imdbId,
      title: minimalEntityDecode(titleRaw),
      year: Number(yearRaw),
    });
  }

  return out;
}

@Controller('api/parse')
export class ImdbSearchController {
  @Get('imdbSearch')
  async imdbSearch(@Query('query') query: string | undefined, @Req() req: Request) {
    const started = Date.now();

    const q = (query ?? '').trim();
    if (!q) {
      const latency = Date.now() - started;
      const resp: ImdbSearchResponse = {
        statusCode: 400,
        query: q,
        url: '',
        filePath: null,
        errors: ['Missing required query param: query'],
        latency,
        size: 0,
        results: [],
      };
      return resp;
    }

    // Call the existing endpoint so it writes temp/<host>-<hash>.html
    const imdbUrl = `https://www.imdb.com/find/?q=${encodeURIComponent(q)}`;

    const proto =
      (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim() ||
      req.protocol ||
      'http';

    const host =
      (req.headers['x-forwarded-host'] as string | undefined)?.split(',')[0]?.trim() ||
      req.get('host');

    const base = `${proto}://${host}`;
    const localParseUrl = `${base}/api/parse/html?url=${encodeURIComponent(imdbUrl)}`;

    let parseResp: ParseHtmlResponse;
    try {
      const r = await fetch(localParseUrl, { redirect: 'follow' });
      parseResp = (await r.json()) as ParseHtmlResponse;
    } catch (e: any) {
      const latency = Date.now() - started;
      return {
        statusCode: 500,
        query: q,
        url: imdbUrl,
        filePath: null,
        errors: [e?.message ? String(e.message) : 'Failed to call /api/parse/html'],
        latency,
        size: 0,
        results: [],
      } satisfies ImdbSearchResponse;
    }

    if (!parseResp.filePath || parseResp.errors?.length) {
      const latency = Date.now() - started;
      return {
        statusCode: parseResp.statusCode || 500,
        query: q,
        url: parseResp.url || imdbUrl,
        filePath: parseResp.filePath ?? null,
        errors: parseResp.errors?.length ? parseResp.errors : ['No filePath returned'],
        latency,
        size: parseResp.size ?? 0,
        results: [],
      } satisfies ImdbSearchResponse;
    }

    // Safety: only read from temp/
    if (!parseResp.filePath.startsWith('temp/')) {
      const latency = Date.now() - started;
      return {
        statusCode: 400,
        query: q,
        url: parseResp.url || imdbUrl,
        filePath: parseResp.filePath,
        errors: ['Invalid filePath (must start with temp/)'],
        latency,
        size: 0,
        results: [],
      } satisfies ImdbSearchResponse;
    }

    const absPath = path.join(process.cwd(), parseResp.filePath);

    let html = '';
    try {
      html = await readFile(absPath, 'utf8');
    } catch (e: any) {
      const latency = Date.now() - started;
      return {
        statusCode: 500,
        query: q,
        url: parseResp.url || imdbUrl,
        filePath: parseResp.filePath,
        errors: [e?.message ? String(e.message) : 'Failed to read saved HTML file'],
        latency,
        size: 0,
        results: [],
      } satisfies ImdbSearchResponse;
    }

    const results = parseImdbFindHtml(html);
    const latency = Date.now() - started;

    return {
      statusCode: 200,
      query: q,
      url: parseResp.url || imdbUrl,
      filePath: parseResp.filePath,
      errors: [],
      latency,
      size: parseResp.size ?? Buffer.byteLength(html, 'utf8'),
      results,
    } satisfies ImdbSearchResponse;
  }
}
