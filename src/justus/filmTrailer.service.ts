import { Injectable } from '@nestjs/common';

type FilmTrailerVideo = {
  videoId: string;
  title: string;
  description: string;
  thumbnails: unknown;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
};

type FilmTrailerBody = {
  requestId: string;
  statusCode: number;
  dataSource: 'youtube';
  query?: {
    q: string;
    maxResults: number;
  };
  videos: FilmTrailerVideo[];
  videoCount: number;
  errors: string[];
  upstreamBody?: string;
};

export type FilmTrailerResult = {
  statusCode: number;
  body: FilmTrailerBody;
};

@Injectable()
export class FilmTrailerService {
  async search(
    traceId: string,
    rawParams: Record<string, string | string[] | undefined>,
  ): Promise<FilmTrailerResult> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return this.buildResult(500, {
        requestId: traceId,
        statusCode: 500,
        dataSource: 'youtube',
        videos: [],
        videoCount: 0,
        errors: ['Missing YOUTUBE_API_KEY'],
      });
    }

    const query = this.pickQuery(rawParams);
    if (!query) {
      return this.buildResult(400, {
        requestId: traceId,
        statusCode: 400,
        dataSource: 'youtube',
        videos: [],
        videoCount: 0,
        errors: ["Missing search query 'query'"],
      });
    }

    const maxResults = this.parseMaxResults(rawParams.maxResults);
    const youtubeUrl = this.buildYoutubeUrl(query, maxResults, apiKey);

    let upstreamStatus = 200;
    const errors: string[] = [];
    let videos: FilmTrailerVideo[] = [];

    try {
      const upstream = await fetch(youtubeUrl, {
        method: 'GET',
        headers: { 'x-trace-id': traceId },
      });

      upstreamStatus = upstream.status;
      const rawBody = await upstream.text();

      if (!upstream.ok) {
        errors.push('Upstream YouTube request failed');
        return this.buildResult(upstreamStatus, {
          requestId: traceId,
          statusCode: upstreamStatus,
          dataSource: 'youtube',
          videos: [],
          videoCount: 0,
          errors,
          upstreamBody: rawBody,
        });
      }

      const parsed = rawBody ? (JSON.parse(rawBody) as { items?: unknown[] }) : { items: [] };
      videos = this.extractVideos(parsed.items);
    } catch (error: any) {
      upstreamStatus = 500;
      errors.push('Upstream fetch failed');
      errors.push(error?.message ? String(error.message) : 'Unknown error');
    }

    return this.buildResult(upstreamStatus, {
      requestId: traceId,
      statusCode: upstreamStatus,
      dataSource: 'youtube',
      query: { q: query, maxResults },
      videos,
      videoCount: videos.length,
      errors,
    });
  }

  private pickQuery(rawParams: Record<string, string | string[] | undefined>): string {
    const fromQuery = this.firstValue(rawParams.query);
    if (fromQuery.trim()) return fromQuery.trim();

    const fromQ = this.firstValue(rawParams.q);
    return fromQ.trim();
  }

  private parseMaxResults(value: string | string[] | undefined): number {
    const raw = this.firstValue(value);
    if (!raw) return 10;

    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) return 10;

    return Math.max(0, Math.min(50, parsed));
  }

  private buildYoutubeUrl(query: string, maxResults: number, apiKey: string): string {
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: String(maxResults),
      key: apiKey,
    });

    return `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
  }

  private extractVideos(items: unknown): FilmTrailerVideo[] {
    if (!Array.isArray(items)) return [];

    const out: FilmTrailerVideo[] = [];
    for (const item of items) {
      const source = item as any;
      const videoId = source?.id?.videoId;
      const snippet = source?.snippet;

      if (!videoId || !snippet) continue;

      out.push({
        videoId: String(videoId),
        title: String(snippet.title ?? ''),
        description: String(snippet.description ?? ''),
        thumbnails: snippet.thumbnails ?? null,
        channelId: String(snippet.channelId ?? ''),
        channelTitle: String(snippet.channelTitle ?? ''),
        publishedAt: String(snippet.publishedAt ?? ''),
      });
    }

    return out;
  }

  private firstValue(value: string | string[] | undefined): string {
    if (Array.isArray(value)) return value[0] ?? '';
    return value ?? '';
  }

  private buildResult(statusCode: number, body: FilmTrailerBody): FilmTrailerResult {
    return { statusCode, body };
  }
}
