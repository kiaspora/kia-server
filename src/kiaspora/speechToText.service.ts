import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import Busboy from 'busboy';

import { runGoogleSpeechToTextCore } from './googleSpeechToText';

type RouterBody = {
  languageCode?: unknown;
  altLanguageCodes?: unknown;
  languageCodes?: unknown;
  model?: unknown;
  mimeType?: unknown;
  base64Audio?: unknown;
  sampleRateHertz?: unknown;
  traceId?: unknown;
};

const MULTIPART_MAX_BYTES = 20 * 1024 * 1024; // 20MB

class HttpError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
  }
}

function pickTraceId(req: Request, body?: any): string {
  // per tmpl-api-pattern.md: middleware attaches req.traceId
  const fromMiddleware = (req as any)?.traceId;
  if (typeof fromMiddleware === 'string' && fromMiddleware.trim()) return fromMiddleware.trim();

  const fromHeader = req.headers['x-trace-id'];
  if (typeof fromHeader === 'string' && fromHeader.trim()) return fromHeader.trim();

  const bodyTrace = body?.traceId ?? body?.trace_id ?? body?.TraceId;
  if (typeof bodyTrace === 'string' && bodyTrace.trim()) return bodyTrace.trim();

  // IMPORTANT: Cloud Function default for this route
  return 'stt-trace';
}

@Injectable()
export class SpeechToTextService {
  parseJsonBody(raw: any): RouterBody {
    // In Nest, JSON is already parsed, but keep parity with the Functions parser:
    if (!raw) return {};
    if (typeof raw === 'object') return raw as any;
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        throw new HttpError(400, 'Invalid JSON body');
      }
    }
    throw new HttpError(400, 'Invalid request body');
  }

  /**
   * Multipart parsing equivalent to Cloud Function:
   * - Accepts file field: "audio" or "file"
   * - Enforces 20MB limit
   * - Produces audioBase64 as data:<mime>;base64,<...>
   */
  async parseMultipart(req: Request): Promise<{ body: RouterBody; audioBase64?: string }> {
    return await new Promise((resolve, reject) => {
      const bb = Busboy({
        headers: req.headers as any,
        limits: { files: 1, fileSize: MULTIPART_MAX_BYTES },
      });

      const fields: Record<string, string> = {};
      let fileBuffer: Buffer | null = null;
      let fileMime: string | null = null;
      let sawFile = false;

      bb.on('field', (name, value) => {
        fields[name] = value;
      });

      bb.on('file', (name, file, info) => {
        if (name !== 'audio' && name !== 'file') {
          file.resume();
          return;
        }

        sawFile = true;
        fileMime = info?.mimeType || 'application/octet-stream';

        const chunks: Buffer[] = [];
        let total = 0;

        file.on('data', (d: Buffer) => {
          total += d.length;
          if (total > MULTIPART_MAX_BYTES) {
            reject(new HttpError(413, 'Uploaded audio is too large'));
            file.resume();
            return;
          }
          chunks.push(d);
        });

        file.on('limit', () => reject(new HttpError(413, 'Uploaded audio is too large')));
        file.on('end', () => {
          fileBuffer = Buffer.concat(chunks);
        });
        file.on('error', () => reject(new HttpError(400, 'Failed to read uploaded audio')));
      });

      bb.on('error', () => reject(new HttpError(400, 'Invalid multipart/form-data payload')));

      bb.on('finish', () => {
        if (!sawFile || !fileBuffer || fileBuffer.length === 0) {
          reject(new HttpError(400, 'Missing audio file field ("audio" or "file")'));
          return;
        }

        const traceId = fields.traceId?.trim?.() || undefined;
        const languageCode = fields.languageCode?.trim?.() || undefined;
        const altLanguageCodes = fields.altLanguageCodes?.trim?.() || undefined;
        const languageCodes = fields.languageCodes?.trim?.() || undefined;
        const model = fields.model?.trim?.() || undefined;
        const mimeType = (fields.mimeType || fileMime || 'audio/wav').trim();
        const sampleRateHertzRaw = fields.sampleRateHertz?.trim?.();

        const body: RouterBody = {
          traceId,
          languageCode,
          altLanguageCodes,
          languageCodes,
          model,
          mimeType,
        };

        if (sampleRateHertzRaw && /^\d+$/.test(sampleRateHertzRaw)) {
          body.sampleRateHertz = Number(sampleRateHertzRaw);
        }

        const b64 = fileBuffer.toString('base64');
        resolve({
          body,
          audioBase64: `data:${mimeType};base64,${b64}`,
        });
      });

      // Same rawBody fallback pattern used elsewhere in this repo.
      const raw: any = (req as any).rawBody ?? (req as any).body;
      if (Buffer.isBuffer(raw)) bb.end(raw);
      else req.pipe(bb);
    });
  }

  /**
   * Main router logic.
   * Returns stable response shape (must match Cloud Function):
   * { model, aiProvider, latency_ms, text, traceId }
   */
  async run(rawBody: RouterBody, req: Request, audioBase64?: string): Promise<{
    model: string;
    aiProvider: 'google';
    latency_ms: number;
    text: string;
    traceId: string;
  }> {
    const body = this.parseJsonBody(rawBody);

    const traceId =
      typeof body.traceId === 'string' && body.traceId.trim()
        ? body.traceId.trim()
        : pickTraceId(req, body);

    const out = await runGoogleSpeechToTextCore({
      body,
      traceId,
      audioBase64: audioBase64 ?? (typeof body.base64Audio === 'string' ? (body.base64Audio as any) : undefined),
    });

    return {
      model: out.model,
      aiProvider: 'google',
      latency_ms: out.latency_ms,
      text: out.text,
      traceId: out.traceId,
    };
  }
}
