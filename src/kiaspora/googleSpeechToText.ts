import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { transcode } from './ffmpeg';

type RouterBody = {
  languageCode?: unknown; // e.g. "zh-CN" (primary)
  altLanguageCodes?: unknown; // e.g. ["en-US","zh-CN"] or "en-US,zh-CN"
  languageCodes?: unknown; // e.g. ["en-US","zh-CN"] (first primary, rest alt)
  model?: unknown;
  mimeType?: unknown; // e.g. "audio/flac" | "audio/wav"
  base64Audio?: unknown;
  sampleRateHertz?: unknown;
};

type ProviderOut = {
  model: string;
  latency_ms: number;
  text: string;
  traceId: string;
};

function requireEnv(name: string): string {
  const v = (process.env[name] ?? '').trim().replace(/^["']|["']$/g, '');
  if (!v) throw new Error(`Server misconfigured: missing ${name}`);
  return v;
}

function asString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

function asStringArray(v: unknown): string[] | undefined {
  if (Array.isArray(v) && v.every((x) => typeof x === 'string')) return v as string[];
  return undefined;
}

function asNumber(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

function stripDataUrlToBase64(maybeDataUrl: string): string {
  const idx = maybeDataUrl.indexOf('base64,');
  if (idx !== -1) return maybeDataUrl.slice(idx + 'base64,'.length).trim();
  return maybeDataUrl.trim();
}

function normalizeMimeType(input?: string): string | undefined {
  const raw = (input || '').trim().toLowerCase();
  if (!raw) return undefined;
  return raw.split(';')[0]?.trim() || undefined;
}

async function transcodeToLinear16Wav(inputBytes: Buffer): Promise<Buffer> {
  const id = crypto.randomBytes(8).toString('hex');
  const inPath = path.join(os.tmpdir(), `stt-in-${id}`);
  const outPath = path.join(os.tmpdir(), `stt-out-${id}.wav`);

  await fs.writeFile(inPath, inputBytes);

  await transcode({
    input: inPath,
    output: outPath,
    args: ['-vn', '-ac', '1', '-ar', '16000', '-acodec', 'pcm_s16le', '-f', 'wav'],
  });

  const wav = await fs.readFile(outPath);
  await Promise.allSettled([fs.unlink(inPath), fs.unlink(outPath)]);
  return wav;
}

/**
 * Accepts:
 * - ["en-US","zh-CN"]
 * - "en-US, zh-CN"
 * - "en-US"
 */
function parseLanguageList(v: unknown): string[] {
  const arr = asStringArray(v);
  if (arr) return arr.map((s) => s.trim()).filter(Boolean);

  const s = asString(v);
  if (!s) return [];
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

/**
 * Very strict and predictable validation:
 * - Keeps only BCP-47-ish tags like en-US, zh-CN, es-419.
 * - Removes duplicates (case-insensitive compare).
 * - Hard cap: 1 primary + up to 2 alternatives (max 3 total)
 */
function normalizeLanguages(input: {
  languageCode?: string;
  languageCodes?: unknown;
  altLanguageCodes?: unknown;
}): { primary: string; alternatives: string[] } {
  const primaryFromSingle = (input.languageCode || '').trim();

  // languageCodes takes precedence as the “full set”
  const fromLanguageCodes = parseLanguageList(input.languageCodes);
  const fromAlt = parseLanguageList(input.altLanguageCodes);

  let combined: string[] = [];
  if (fromLanguageCodes.length > 0) {
    combined = fromLanguageCodes;
  } else {
    if (primaryFromSingle) combined.push(primaryFromSingle);
    combined.push(...fromAlt);
  }

  // Default if nothing provided
  if (combined.length === 0) combined = ['en-US'];

  // Validate tag format (simple, deterministic)
  const isValid = (tag: string) => /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})+$/.test(tag);

  // Deduplicate case-insensitively while preserving order
  const seen = new Set<string>();
  const cleaned = combined
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => isValid(t))
    .filter((t) => {
      const key = t.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  // Hard cap: 3 total languages (1 primary + 2 alternatives)
  const capped = cleaned.slice(0, 3);

  const primary = capped[0] || 'en-US';
  const alternatives = capped.slice(1);

  return { primary, alternatives };
}

/**
 * Core runner: returns stable shape.
 * Uses REST Speech API (API key) instead of @google-cloud/speech ADC.
 */
export async function runGoogleSpeechToTextCore(params: {
  body: RouterBody;
  traceId: string;
  audioBase64?: string; // router can pass this from multipart
}): Promise<ProviderOut> {
  const started = Date.now();
  const { body, traceId } = params;

  const base64FromBody = asString(body.base64Audio);
  const base64FromRouter = params.audioBase64;

  const audioB64 = base64FromRouter || base64FromBody;
  if (!audioB64) {
    throw new Error('Missing audio. Provide multipart file ("audio" or "file") or JSON base64Audio.');
  }

  const mimeType = normalizeMimeType(asString(body.mimeType));
  const audioContent = stripDataUrlToBase64(audioB64);
  const inputBytes = Buffer.from(audioContent, 'base64');

  // Multilingual selection: primary + alternatives
  const { primary, alternatives } = normalizeLanguages({
    languageCode: asString(body.languageCode),
    languageCodes: body.languageCodes,
    altLanguageCodes: body.altLanguageCodes,
  });

  // Build config + audio per mimeType logic (same intent as old provider)
  const request: any = {
    config: {
      languageCode: primary,
      enableAutomaticPunctuation: true,
    },
    audio: { content: '' },
  };

  if (alternatives.length > 0) {
    request.config.alternativeLanguageCodes = alternatives;
  }

  const requestedSampleRate = asNumber(body.sampleRateHertz);
  if (mimeType === 'audio/3gpp' || mimeType === 'audio/amr') {
    request.config.encoding = 'AMR';
    request.config.sampleRateHertz = requestedSampleRate || 8000;
    request.config.audioChannelCount = 1;
    request.audio.content = inputBytes.toString('base64');
  } else if (mimeType === 'audio/amr-wb') {
    request.config.encoding = 'AMR_WB';
    request.config.sampleRateHertz = requestedSampleRate || 16000;
    request.config.audioChannelCount = 1;
    request.audio.content = inputBytes.toString('base64');
  } else {
    const wavBytes = await transcodeToLinear16Wav(inputBytes);
    request.config.encoding = 'LINEAR16';
    request.config.sampleRateHertz = 16000;
    request.config.audioChannelCount = 1;
    request.audio.content = wavBytes.toString('base64');
  }

  // Optional model passthrough (same as old provider)
  const model = asString(body.model);
  if (model) request.config.model = model;

  const apiKey = requireEnv('GOOGLE_API_KEY');

  const res = await fetch(
    `https://speech.googleapis.com/v1/speech:recognize?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-trace-id': traceId,
      },
      body: JSON.stringify(request),
    },
  );

  const latency_ms = Date.now() - started;

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Upstream google stt error: HTTP ${res.status} ${res.statusText} ${text}`);
  }

  const json: any = await res.json().catch(() => ({}));

  const outText =
    (json?.results || [])
      .map((r: any) => r?.alternatives?.[0]?.transcript || '')
      .join(' ')
      .trim() || '';

  return {
    model: 'google-speech-to-text',
    latency_ms,
    text: outText,
    traceId,
  };
}
