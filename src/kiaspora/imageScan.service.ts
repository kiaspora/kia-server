import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import Busboy from 'busboy';

type RouterBody = {
  aiProvider?: unknown;
  base64Image?: unknown;
  mimeType?: unknown;
  customPrompt?: unknown;
  traceId?: unknown;
  imageUrl?: unknown;
};

const MULTIPART_MAX_BYTES = 12 * 1024 * 1024; // 12MB

class HttpError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
  }
}

function normalizeAiProvider(v: unknown): 'openai' | 'google' | null {
  if (typeof v !== 'string') return null;
  const trimmed = v.trim().toLowerCase();
  if (trimmed === 'openai') return 'openai';
  if (trimmed === 'google' || trimmed === 'vision' || trimmed === 'google-vision') return 'google';
  return null;
}

function pickTraceId(req: Request, body?: any): string {
  // per tmpl-api-pattern.md: middleware attaches req.traceId
  const fromMiddleware = (req as any)?.traceId;
  if (typeof fromMiddleware === 'string' && fromMiddleware.trim()) return fromMiddleware.trim();

  const fromHeader = req.headers['x-trace-id'];
  if (typeof fromHeader === 'string' && fromHeader.trim()) return fromHeader.trim();

  const bodyTrace = body?.traceId ?? body?.trace_id ?? body?.TraceId;
  if (typeof bodyTrace === 'string' && bodyTrace.trim()) return bodyTrace.trim();

  // keep same default as function (it used "router-trace" if not string)
  return 'router-trace';
}

function requireEnv(name: string): string {
  const v = (process.env[name] ?? '').trim().replace(/^["']|["']$/g, '');
  if (!v) throw new HttpError(500, `Server misconfigured: missing ${name}`);
  return v;
}

@Injectable()
export class ImageScanService {
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
   * Multipart parse (Busboy) similar to Functions version.
   * - Supports file fields: "image" or "file"
   * - Supports imageUrl-only payloads
   * - Enforces 12MB limit
   */
  async parseMultipart(req: Request): Promise<RouterBody> {
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
        if (name !== 'image' && name !== 'file') {
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
            reject(new HttpError(413, 'Uploaded file is too large'));
            file.resume();
            return;
          }
          chunks.push(d);
        });

        file.on('limit', () => reject(new HttpError(413, 'Uploaded file is too large')));
        file.on('end', () => {
          fileBuffer = Buffer.concat(chunks);
        });
        file.on('error', () => reject(new HttpError(400, 'Failed to read uploaded file')));
      });

      bb.on('error', () => reject(new HttpError(400, 'Invalid multipart/form-data payload')));

      bb.on('finish', () => {
        const aiProvider = fields.aiProvider?.trim?.() || undefined;
        const traceId = fields.traceId?.trim?.() || undefined;
        const customPrompt = fields.customPrompt || undefined;

        const imageUrl =
          fields.imageUrl?.trim?.() && fields.imageUrl.trim().length > 0
            ? fields.imageUrl.trim()
            : undefined;

        const mimeType = (fields.mimeType || fileMime || 'image/png').trim();

        if (!aiProvider) {
          reject(new HttpError(400, 'Missing aiProvider. Expected "openai" or "google".'));
          return;
        }

        if (!imageUrl && !sawFile) {
          reject(
            new HttpError(
              400,
              'Either imageUrl or an image file field ("image" or "file") is required',
            ),
          );
          return;
        }

        const body: RouterBody = { aiProvider, traceId, customPrompt, imageUrl, mimeType };

        // normalize file -> base64 data URL
        if (!imageUrl && fileBuffer && fileBuffer.length > 0) {
          const b64 = fileBuffer.toString('base64');
          body.base64Image = `data:${mimeType};base64,${b64}`;
        }

        resolve(body);
      });

      // In Nest/Express on Railway, stream is usually available; if some middleware
      // has already buffered, this supports Buffer raw bodies as well.
      const raw: any = (req as any).rawBody ?? (req as any).body;
      if (Buffer.isBuffer(raw)) bb.end(raw);
      else req.pipe(bb);
    });
  }

  /**
   * Main router logic.
   * Returns stable response shape:
   * { model, aiProvider, latency_ms, translation, traceId }
   */
  async run(rawBody: RouterBody, req: Request): Promise<{
    model: string;
    aiProvider: 'openai' | 'google';
    latency_ms: number;
    translation: string;
    traceId: string;
  }> {
    const body = this.parseJsonBody(rawBody);
    const aiProvider = normalizeAiProvider(body.aiProvider);
    if (!aiProvider) {
      throw new HttpError(400, 'Invalid aiProvider. Expected "openai" or "google".');
    }

    const traceId =
      typeof body.traceId === 'string' && body.traceId.trim()
        ? body.traceId.trim()
        : pickTraceId(req, body);

    if (aiProvider === 'openai') {
      const out = await this.runOpenaiImageScanCore({ body, traceId });
      return {
        model: out.model,
        aiProvider,
        latency_ms: out.latency_ms,
        translation: out.translation,
        traceId: out.traceId,
      };
    }

    const out = await this.runGoogleVisionOcrCore({ body, traceId });
    return {
      model: out.model,
      aiProvider,
      latency_ms: out.latency_ms,
      translation: out.translation,
      traceId: out.traceId,
    };
  }

  /**
   * OpenAI image scan core (replaces functions/src/providers/openaiImageScan).
   * Contract matches:
   * { model, latency_ms, translation, traceId }
   */
  private async runOpenaiImageScanCore(args: { body: RouterBody; traceId: string }) {
    const { body, traceId } = args;

    const apiKey = requireEnv('OPENAI_KIA_API_KEY');
    const model = (process.env.OPENAI_IMAGE_SCAN_MODEL || 'gpt-4.1-mini').trim();

    const imageUrl =
      typeof body.imageUrl === 'string' && body.imageUrl.trim().length > 0 ? body.imageUrl.trim() : null;

    const base64Image =
      typeof body.base64Image === 'string' && body.base64Image.trim().length > 0
        ? body.base64Image.trim()
        : null;

    if (!imageUrl && !base64Image) {
      throw new HttpError(400, 'Either imageUrl or base64Image is required');
    }

    const customPrompt =
      typeof body.customPrompt === 'string' && body.customPrompt.trim()
        ? body.customPrompt.trim()
        : 'Extract the text from this image. Return only the extracted text.';

    // Use Responses API (matches your translationChat OpenAI usage style)
    const endpoint = (process.env.OPENAI_API_URL || 'https://api.openai.com/v1/responses').trim();

    const inputImage = imageUrl ?? base64Image;

    const requestPayload = {
      model,
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: customPrompt },
            // OpenAI accepts https URL or data URL
            { type: 'input_image', image_url: inputImage },
          ],
        },
      ],
    };

    const started = Date.now();
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
        'x-trace-id': traceId,
      },
      body: JSON.stringify(requestPayload),
    });
    const latency_ms = Date.now() - started;

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Upstream openai error: HTTP ${res.status} ${res.statusText} ${text}`);
    }

    const json = await res.json().catch(() => ({}));

    // Same “buildAnswer” logic used in translationChat
    let translation =
      json?.output_text?.trim?.() ||
      json?.choices?.[0]?.message?.content?.trim?.() ||
      '';

    if (!translation && Array.isArray(json?.output)) {
      const parts: string[] = [];
      for (const item of json.output) {
        for (const block of item?.content || []) {
          if (typeof block?.text?.value === 'string') parts.push(block.text.value);
          else if (typeof block?.text === 'string') parts.push(block.text);
        }
      }
      translation = parts.join('').trim();
    }

    return { model, latency_ms, translation: translation || '', traceId };
  }

  /**
   * Google Vision OCR core (replaces functions/src/providers/googleVisionOcrScan).
   * Contract matches:
   * { model, latency_ms, translation, traceId }
   */
  private async runGoogleVisionOcrCore(args: { body: RouterBody; traceId: string }) {
    const { body, traceId } = args;

    const apiKey = requireEnv('GOOGLE_API_KEY');
    const model = 'google-vision-ocr';

    const imageUrl =
      typeof body.imageUrl === 'string' && body.imageUrl.trim().length > 0 ? body.imageUrl.trim() : null;

    const base64Image =
      typeof body.base64Image === 'string' && body.base64Image.trim().length > 0
        ? body.base64Image.trim()
        : null;

    if (!imageUrl && !base64Image) {
      throw new HttpError(400, 'Either imageUrl or base64Image is required');
    }

    // Vision API expects either:
    // - image.source.imageUri
    // - or image.content (base64, without the data: prefix)
    let image: any;
    if (imageUrl) {
      image = { source: { imageUri: imageUrl } };
    } else {
      const b64 = base64Image!.startsWith('data:')
        ? base64Image!.split('base64,')[1] || ''
        : base64Image!;
      if (!b64) throw new HttpError(400, 'Invalid base64Image');
      image = { content: b64 };
    }

    const started = Date.now();
    const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-trace-id': traceId,
      },
      body: JSON.stringify({
        requests: [
          {
            image,
            features: [{ type: 'TEXT_DETECTION' }],
          },
        ],
      }),
    });
    const latency_ms = Date.now() - started;

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Upstream google vision error: HTTP ${res.status} ${res.statusText} ${text}`);
    }

    const json = await res.json().catch(() => ({}));
    const resp = json?.responses?.[0] ?? {};
    const translation =
      (resp?.fullTextAnnotation?.text as string | undefined) ||
      (resp?.textAnnotations?.[0]?.description as string | undefined) ||
      '';

    return { model, latency_ms, translation: (translation || '').trim(), traceId };
  }
}
