import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { URL } from 'node:url';
import path from 'node:path';
import { BearerTokenGuard } from '../auth/bearer-token.guard';

type ParseHtmlResponse = {
  statusCode: number;        // remote fetch status, or 400/500 for local validation/runtime
  url: string;               // final URL (after redirects if fetch succeeds), else input
  filePath: string | null;   // saved file path (relative), else null
  errors: string[];
  latency: number;           // ms
  size: number;              // bytes (html bytes if saved, else 0)
};

@Controller('api/parse')
export class ParseController {
  @UseGuards(BearerTokenGuard)
  @Get('html')
  async parseHtml(
    @Query('url') urlStr: string | undefined,
    @Res() res: Response,
  ) {
    const started = Date.now();

    const done = (payload: Omit<ParseHtmlResponse, 'latency'>) => {
      const latency = Date.now() - started;
      const full: ParseHtmlResponse = { ...payload, latency };
      return res.status(200).json(full);
    };

    if (!urlStr) {
      return done({
        statusCode: 400,
        url: '',
        filePath: null,
        errors: ['Missing required query param: url'],
        size: 0,
      });
    }

    let u: URL;
    try {
      u = new URL(urlStr);
    } catch {
      return done({
        statusCode: 400,
        url: urlStr,
        filePath: null,
        errors: ['Invalid url'],
        size: 0,
      });
    }

    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return done({
        statusCode: 400,
        url: u.toString(),
        filePath: null,
        errors: ['Only http/https urls are allowed'],
        size: 0,
      });
    }

    try {
      const r = await fetch(u.toString(), {
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          'Accept-Language': 'en-US,en;q=0.9',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!r.ok) {
        return done({
          statusCode: r.status,
          url: r.url || u.toString(),
          filePath: null,
          errors: [`Fetch failed: ${r.status} ${r.statusText}`],
          size: 0,
        });
      }

      const html = await r.text();
      const size = Buffer.byteLength(html, 'utf8');

      const safeHost = (new URL(r.url || u.toString()).host || 'unknown-host')
        .replace(/[^a-zA-Z0-9.-]/g, '_');

      const hash = createHash('sha1').update(r.url || u.toString()).digest('hex').slice(0, 10);
      const filename = `${safeHost}-${hash}.html`;

      const outDir = path.join(process.cwd(), 'temp');
      const outPath = path.join(outDir, filename);

      await mkdir(outDir, { recursive: true });
      await writeFile(outPath, html, 'utf8');

      return done({
        statusCode: r.status,
        url: r.url || u.toString(),
        filePath: `temp/${filename}`,
        errors: [],
        size,
      });
    } catch (e: any) {
      return done({
        statusCode: 500,
        url: u.toString(),
        filePath: null,
        errors: [e?.message ? String(e.message) : 'Unknown error'],
        size: 0,
      });
    }
  }
}
