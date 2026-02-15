// src/parse/imdb-detail.controller.ts
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';

import { BearerTokenGuard } from '../auth/bearer-token.guard';
import type { TraceRequest } from '../common/trace-id.middleware';

type ParseHtmlResponse = {
  statusCode: number;
  url: string;
  filePath: string | null;
  errors: string[];
  latency: number;
  size: number;
};

type ImdbDetailResponse = {
  requestId: string;
  statusCode: number;
  dataSource: 'imdb';
  imdbId: string;
  info: {
    title: string;
    year: string;
    rated: string;
    released: string;
    runtime: string; // minutes
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
  errors: string[];
};

function parseRuntimeToMinutes(runtimeText: string): string {
  // runtimeText examples: "1h", "1h 36m", "96m"
  const t = runtimeText.toLowerCase().replace(/\s+/g, ' ').trim();

  const hm = /^(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?$/.exec(t);
  if (hm) {
    const h = hm[1] ? Number(hm[1]) : 0;
    const m = hm[2] ? Number(hm[2]) : 0;
    const mins = h * 60 + m;
    if (mins > 0) return String(mins);
  }

  const mm = /^(\d+)\s*m$/.exec(t);
  if (mm) return mm[1];

  const hOnly = /^(\d+)\s*h$/.exec(t);
  if (hOnly) return String(Number(hOnly[1]) * 60);

  return '';
}

function usDateToDMY(s: string): string {
  // input: "May 22, 2025 (United States)" or "May 22, 2025"
  const base = (s.split('(')[0] ?? s).trim();
  const m = /^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/.exec(base);
  if (!m) return base;

  const monthMap: Record<string, string> = {
    january: 'Jan',
    february: 'Feb',
    march: 'Mar',
    april: 'Apr',
    may: 'May',
    june: 'Jun',
    july: 'Jul',
    august: 'Aug',
    september: 'Sep',
    october: 'Oct',
    november: 'Nov',
    december: 'Dec',
  };
  const month = monthMap[m[1].toLowerCase()] || m[1].slice(0, 3);
  const day = m[2].padStart(2, '0');
  const year = m[3];
  return `${day} ${month} ${year}`;
}

function isoDateToDMY(s: string): string {
  // input: "2024-10-04"
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIdx = Number(m[2]) - 1;
  if (monthIdx < 0 || monthIdx > 11) return '';
  return `${m[3]} ${months[monthIdx]} ${m[1]}`;
}

function isoDurationToRuntimeText(isoDuration: string): string {
  // input examples: "PT1H43M", "PT103M", "PT2H"
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?$/i.exec(isoDuration.trim());
  if (!m) return '';
  const h = m[1] ? Number(m[1]) : 0;
  const min = m[2] ? Number(m[2]) : 0;
  if (!h && !min) return '';
  return `${h ? `${h}h` : ''}${h && min ? ' ' : ''}${min ? `${min}m` : ''}`.trim();
}

function textOf($: cheerio.CheerioAPI, sel: string): string {
  return $(sel).first().text().replace(/\s+/g, ' ').trim();
}

function firstLinkTextByHrefIncludes($: cheerio.CheerioAPI, hrefIncludes: string): string {
  const a = $(`a[href*="${hrefIncludes}"]`).first();
  return a.text().replace(/\s+/g, ' ').trim();
}

function linkTextsByHrefIncludes($: cheerio.CheerioAPI, hrefIncludes: string): string[] {
  return $(`a[href*="${hrefIncludes}"]`)
    .map((_, a) => $(a).text().replace(/\s+/g, ' ').trim())
    .get()
    .filter(Boolean);
}

type ImdbJsonLd = {
  genre?: string[] | string;
  datePublished?: string;
  duration?: string;
  description?: string;
  image?: string;
  contentRating?: string;
};

function firstMovieJsonLd($: cheerio.CheerioAPI): ImdbJsonLd | null {
  const scripts = $('script[type="application/ld+json"]').toArray();

  const toList = (node: any): any[] => {
    if (!node) return [];
    if (Array.isArray(node)) return node;
    if (Array.isArray(node['@graph'])) return node['@graph'];
    return [node];
  };

  const isMovieType = (t: unknown): boolean => {
    if (typeof t === 'string') return t.toLowerCase() === 'movie';
    if (Array.isArray(t)) return t.some((x) => typeof x === 'string' && x.toLowerCase() === 'movie');
    return false;
  };

  for (const s of scripts) {
    const raw = $(s).text().trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const items = toList(parsed);
      const movie = items.find((it) => isMovieType(it?.['@type']));
      if (movie) return movie as ImdbJsonLd;
    } catch {
      // ignore malformed JSON-LD blocks
    }
  }

  return null;
}

function listLinkTexts($root: cheerio.Cheerio<Element>, $: cheerio.CheerioAPI): string[] {
  return $root
    .find('a')
    .map((_, a) => $(a).text().replace(/\s+/g, ' ').trim())
    .get()
    .filter(Boolean);
}

function findPeopleByLabel(
  $: cheerio.CheerioAPI,
  label: string,
): string {
  // In title-pc-list, label is usually a <span> with exact text like "Director" or "Writer"
  const $list = $('[data-testid="title-pc-list"]').first();
  if (!$list.length) return '';

  const $li = $list
    .find('li[data-testid="title-pc-principal-credit"]')
    .filter((_, li) => {
      const t = $(li).find('span.ipc-metadata-list-item__label').first().text().trim();
      return t === label;
    })
    .first();

  if (!$li.length) return '';

  const names = listLinkTexts($li, $);
  return names.join(', ');
}

function findStars($: cheerio.CheerioAPI): string {
  // Stars label is an <a> with text "Stars" (not a span label)
  const $list = $('[data-testid="title-pc-list"]').first();
  if (!$list.length) return '';

  const $li = $list
    .find('li[data-testid="title-pc-principal-credit"]')
    .filter((_, li) => {
      const t = $(li).find('a.ipc-metadata-list-item__label').first().text().trim();
      return t === 'Stars';
    })
    .first();

  if (!$li.length) return '';

  const names = listLinkTexts($li, $).filter((n) => n !== 'Stars');
  return names.join(', ');
}

@Controller('api/parse')
@UseGuards(BearerTokenGuard)
export class ImdbDetailController {
  @Get('imdbDetail')
  async imdbDetail(@Query('imdbId') imdbIdRaw: string | undefined, @Req() req: TraceRequest) {
    const requestId =
      (req.traceId ||
        (req.headers['x-trace-id'] as string | undefined) ||
        (req.headers['x-request-id'] as string | undefined) ||
        'unknown') + '';

    const imdbId = (imdbIdRaw ?? '').trim();

    const blank: ImdbDetailResponse = {
      requestId,
      statusCode: 400,
      dataSource: 'imdb',
      imdbId,
      info: {
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
      },
      errors: [],
    };

    if (!/^tt\d+$/.test(imdbId)) {
      return {
        ...blank,
        statusCode: 400,
        errors: ['Invalid imdbId (expected tt123...)'],
      };
    }

    // Build local base URL (supports proxies)
    const proto =
      (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim() ||
      (req as any).protocol ||
      'http';

    const host =
      (req.headers['x-forwarded-host'] as string | undefined)?.split(',')[0]?.trim() ||
      (req as any).get?.('host') ||
      req.headers.host;

    const base = `${proto}://${host}`;

    const targetUrl = `https://www.imdb.com/title/${imdbId}`;
    const localParseUrl = `${base}/api/parse/html?url=${encodeURIComponent(targetUrl)}`;

    const auth = (req.headers?.authorization ?? (req.headers as any)?.Authorization) as
      | string
      | undefined;

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
        ...blank,
        statusCode: 500,
        errors: [String(e?.message ?? e)],
      };
    }

    if (!parseResp.filePath || (parseResp.errors?.length ?? 0) > 0) {
      return {
        ...blank,
        statusCode: parseResp.statusCode || 500,
        errors: parseResp.errors?.length ? parseResp.errors : ['No filePath returned'],
      };
    }

    if (!parseResp.filePath.startsWith('temp/')) {
      return {
        ...blank,
        statusCode: 400,
        errors: ['Invalid filePath (must start with temp/)'],
      };
    }

    const absPath = path.join(process.cwd(), parseResp.filePath);

    let html = '';
    try {
      html = await readFile(absPath, 'utf8');
    } catch (e: any) {
      return {
        ...blank,
        statusCode: 500,
        errors: [String(e?.message ?? e)],
      };
    }

    const $ = cheerio.load(html);
    const bodyClone = $('body').clone();
    bodyClone.find('script, style, noscript').remove();
    const bodyText = bodyClone.text().replace(/\s+/g, ' ').trim();
    const jsonLd = firstMovieJsonLd($);

    // ---- hero: title / year / rated / runtime ----
    const title = textOf($, 'h1[data-testid="hero__pageTitle"]');
    const yearRaw =
      firstLinkTextByHrefIncludes($, '/releaseinfo/?ref_=tt_ov_rdat') ||
      firstLinkTextByHrefIncludes($, '/releaseinfo/');
    const year = yearRaw || (jsonLd?.datePublished ? jsonLd.datePublished.slice(0, 4) : '');
    const ratedRaw =
      firstLinkTextByHrefIncludes($, '/parentalguide/?ref_=tt_ov_pg#certificates') ||
      firstLinkTextByHrefIncludes($, '/parentalguide/');
    const rated = /^[A-Z0-9-]{1,10}$/.test(ratedRaw)
      ? ratedRaw
      : /^[A-Z0-9-]{1,10}$/.test(jsonLd?.contentRating ?? '')
        ? (jsonLd?.contentRating ?? '')
        : '';

    const heroItems = $('h1[data-testid="hero__pageTitle"]')
      .first()
      .parent()
      .find('ul.ipc-inline-list li.ipc-inline-list__item')
      .map((_, li) => $(li).text().replace(/\s+/g, ' ').trim())
      .get()
      .filter(Boolean);

    let runtimeText =
      heroItems.find((x) => /\b\d+\s*h(?:\s*\d+\s*m)?\b/i.test(x) || /^\d+\s*m$/i.test(x)) || '';

    if (!runtimeText && jsonLd?.duration) {
      runtimeText = isoDurationToRuntimeText(jsonLd.duration);
    }

    if (!runtimeText) {
      const runtimeMatch = bodyText.match(/\bRuntime\b[^A-Za-z0-9]*(\d+\s*h(?:\s*\d+\s*m)?|\d+\s*m)\b/i);
      runtimeText = runtimeMatch?.[1]?.trim() ?? '';
    }

    const runtime = parseRuntimeToMinutes(runtimeText);

    // ---- genres (Storyline section) ----
    const genreParts = linkTextsByHrefIncludes($, 'ref_=tt_stry_gnr').length
      ? linkTextsByHrefIncludes($, 'ref_=tt_stry_gnr')
      : linkTextsByHrefIncludes($, '/search/title/?genres=').length
        ? linkTextsByHrefIncludes($, '/search/title/?genres=')
        : linkTextsByHrefIncludes($, 'explore=genres');
    const genreFromJsonLd = Array.isArray(jsonLd?.genre)
      ? jsonLd.genre
      : typeof jsonLd?.genre === 'string'
        ? [jsonLd.genre]
        : [];
    const genre = [...new Set((genreParts.length ? genreParts : genreFromJsonLd).filter(Boolean))].join(', ');

    // ---- plot (Storyline section) ----
    let plot = $('[data-testid="storyline-plot-summary"] .ipc-html-content-inner-div')
      .first()
      .text()
      .replace(/\s+/g, ' ')
      .trim();

    if (!plot) {
      plot = textOf($, '[data-testid="plot-xl"]');
    }
    if (!plot) {
      plot = textOf($, '[data-testid="plot-l"]');
    }
    if (!plot && jsonLd?.description) {
      plot = jsonLd.description.trim();
    }
    plot = plot.replace(/\s+Read all$/i, '').trim();

    if (!plot) {
      const m = bodyText.match(/([A-Z][^.?!]{40,}[.?!])\s*Read all/i);
      if (m?.[1]) plot = m[1].trim();
    }

    // ---- details: release / country / language ----
    let released = '';
    const releaseTexts = $('[data-testid="title-details-releasedate"] a')
      .map((_, a) => $(a).text().replace(/\s+/g, ' ').trim())
      .get()
      .filter(Boolean);
    const releaseText =
      releaseTexts.find((t) => /\b[A-Z][a-z]+\s+\d{1,2},\s*\d{4}\b/.test(t)) || '';
    if (releaseText) {
      released = usDateToDMY(releaseText);
    } else if (jsonLd?.datePublished) {
      released = isoDateToDMY(jsonLd.datePublished);
    }

    const country = textOf($, '[data-testid="title-details-origin"] a.ipc-metadata-list-item__list-content-item');
    const language = textOf($, '[data-testid="title-details-languages"] a.ipc-metadata-list-item__list-content-item');

    // ---- people: director/creator, writers, actors ----
    const director = findPeopleByLabel($, 'Director') || findPeopleByLabel($, 'Creator');
    // IMDB sometimes uses Writer singular; return joined names regardless.
    const writers = findPeopleByLabel($, 'Writers') || findPeopleByLabel($, 'Writer');
    const actors = findStars($);

    // ---- poster ----
    const poster =
      $('meta[property="og:image"]').attr('content')?.trim() ||
      jsonLd?.image?.trim() ||
      $('img.ipc-image[src*="m.media-amazon.com/images"]').first().attr('src')?.trim() ||
      '';

    // ---- enforce “must be found in HTML” ----
    const errors: string[] = [];
    const require = (k: string, v: string) => {
      if (!v) errors.push(`Missing field from HTML: ${k}`);
    };

    require('title', title);
    require('year', year);
    require('rated', rated);
    require('runtime', runtime);
    require('genre', genre);
    require('plot', plot);
    require('poster', poster);
    require('director_or_creator', director);
    require('writers', writers);
    require('actors', actors);

    const resp: ImdbDetailResponse = {
      requestId,
      statusCode: errors.length ? 206 : 200, // partial content if some fields missing
      dataSource: 'imdb',
      imdbId,
      info: {
        title,
        year,
        rated,
        released,
        runtime,
        genre,
        director,
        writers,
        actors,
        plot,
        language,
        country,
        poster,
        imdbId,
      },
      errors,
    };

    try {
      await unlink(absPath);
    } catch {
      // Best-effort cleanup; parsing result is still returned.
    }

    return resp;
  }
}
