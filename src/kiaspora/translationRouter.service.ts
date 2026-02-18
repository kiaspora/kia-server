import { Injectable } from '@nestjs/common';

type Provider = 'deepseek' | 'groq' | 'openai';

type NormalizedRequest = {
  provider: Provider | null;
  sourceText: string;
  sourceLang: string; // default "auto"
  targetLang: string;
  context: string | null; // merged context + userMessage
  customPrompt: string | null;
};

type ProviderResult200 = {
  translation: string;              // canonical JSON string
  detected_source_lang: string;     // best-effort, else "auto"
  provider: Provider;               // who produced it
  latency_ms: number;
  raw_provider_meta: any;           // raw-ish metadata for debugging
};

class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly details?: any,
  ) {
    super(message);
  }
}

function isNonEmptyString(x: any): x is string {
  return typeof x === 'string' && x.trim().length > 0;
}

function pickFirstEnv(...names: string[]) {
  for (const n of names) {
    const v = process.env[n];
    if (isNonEmptyString(v)) return v.trim();
  }
  return '';
}

// Accept both camelCase and snake_case without breaking older clients
function getBodyField(body: any, camel: string, snake: string) {
  if (body && body[camel] !== undefined) return body[camel];
  if (body && body[snake] !== undefined) return body[snake];
  return undefined;
}

function normalizeProvider(raw: any): Provider | null {
  if (raw == null) return null;
  if (typeof raw !== 'string') {
    throw new HttpError(400, 'provider must be a string when provided', 'INVALID_PROVIDER');
  }
  const lower = raw.toLowerCase().trim();
  if (lower !== 'deepseek' && lower !== 'groq' && lower !== 'openai') {
    throw new HttpError(400, 'provider must be "deepseek", "groq", or "openai" when provided', 'INVALID_PROVIDER');
  }
  return lower;
}

function mergeContext(rawContext: any, rawUserMessage: any): string | null {
  const parts: string[] = [];
  if (isNonEmptyString(rawContext)) parts.push(rawContext.trim());
  if (isNonEmptyString(rawUserMessage)) parts.push(`userMessage: ${rawUserMessage.trim()}`);
  const merged = parts.filter(Boolean).join('\n\n');
  return merged.trim() ? merged : null;
}

/**
 * Turn model output into a single JSON object string (no fences).
 * - If output contains code fences, strip them.
 * - If it’s parseable JSON, re-stringify compactly.
 * - Otherwise wrap into the required keys (best-effort).
 */
function toCanonicalTranslationJsonString(raw: string, sourceText: string): string {
  const stripped = String(raw ?? '')
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();

  // Try parse JSON as-is
  try {
    const obj = JSON.parse(stripped);
    if (obj && typeof obj === 'object') {
      // Keep whatever keys exist, but ensure required keys are present
      const out: any = { ...obj };
      if (out.sourceText == null) out.sourceText = sourceText;
      if (out.translatedText == null) out.translatedText = '';
      if (out.sourcePronunciation == null) out.sourcePronunciation = '';
      return JSON.stringify(out);
    }
  } catch {
    // fall through
  }

  // Best-effort wrapper
  return JSON.stringify({
    sourceText,
    translatedText: stripped,
    sourcePronunciation: '',
  });
}

@Injectable()
export class TranslationRouterService {
  async handle(body: any, traceId: string): Promise<ProviderResult200> {
    const validated = this.validate(body);

    const requestPayload = {
      sourceText: validated.sourceText,
      sourceLang: validated.sourceLang,
      targetLang: validated.targetLang,
      context: validated.context,
      customPrompt: validated.customPrompt,
    };

    // Forced provider (no fallback) — matches Cloud Function behavior :contentReference[oaicite:4]{index=4}
    if (validated.provider === 'deepseek') {
      try {
        return await this.callDeepSeek(requestPayload, traceId);
      } catch (err: any) {
        throw new HttpError(
          502,
          'DeepSeek translation is currently unavailable; please try again later',
          'DEEPSEEK_UNAVAILABLE',
          { message: String(err?.message ?? err) },
        );
      }
    }

    if (validated.provider === 'groq') {
      try {
        return await this.callGroq(requestPayload, traceId);
      } catch (err: any) {
        throw new HttpError(
          502,
          'Groq translation is currently unavailable; please try again later',
          'GROQ_UNAVAILABLE',
          { message: String(err?.message ?? err) },
        );
      }
    }

    if (validated.provider === 'openai') {
      try {
        return await this.callOpenAI(requestPayload, traceId);
      } catch (err: any) {
        throw new HttpError(
          502,
          'OpenAI translation is currently unavailable; please try again later',
          'OPENAI_UNAVAILABLE',
          { message: String(err?.message ?? err) },
        );
      }
    }

    // Default: DeepSeek → Groq → OpenAI :contentReference[oaicite:5]{index=5}
    try {
      return await this.callDeepSeek(requestPayload, traceId);
    } catch {
      // swallow and fall through
    }

    try {
      return await this.callGroq(requestPayload, traceId);
    } catch {
      // swallow and fall through
    }

    try {
      return await this.callOpenAI(requestPayload, traceId);
    } catch (err: any) {
      throw new HttpError(
        502,
        'Translation providers are currently unavailable; please try again later',
        'PROVIDERS_UNAVAILABLE',
        { message: String(err?.message ?? err) },
      );
    }
  }

  private validate(body: any): NormalizedRequest {
    // NOTE: support both legacy snake_case and newer camelCase
    const providerRaw = getBodyField(body, 'provider', 'provider');

    const sourceText = getBodyField(body, 'sourceText', 'source_text');
    const targetLang = getBodyField(body, 'targetLang', 'target_lang');
    const sourceLang = getBodyField(body, 'sourceLang', 'source_lang');

    const context = getBodyField(body, 'context', 'context');
    const userMessage = getBodyField(body, 'userMessage', 'user_message');
    const customPrompt = getBodyField(body, 'customPrompt', 'custom_prompt');

    if (!isNonEmptyString(sourceText)) {
      throw new HttpError(400, 'Missing required field: sourceText/source_text', 'MISSING_SOURCE_TEXT');
    }
    if (!isNonEmptyString(targetLang)) {
      throw new HttpError(400, 'Missing required field: targetLang/target_lang', 'MISSING_TARGET_LANG');
    }

    const normalizedProvider = normalizeProvider(providerRaw);

    // Preserve contract: merge context + userMessage :contentReference[oaicite:6]{index=6}
    const mergedContext = mergeContext(context, userMessage);

    return {
      provider: normalizedProvider,
      sourceText: sourceText.trim(),
      sourceLang: isNonEmptyString(sourceLang) ? sourceLang.trim() : 'auto',
      targetLang: targetLang.trim(),
      context: mergedContext,
      customPrompt: isNonEmptyString(customPrompt) ? customPrompt.trim() : null,
    };
  }

  // ---------- Providers ----------

  private async callOpenAI(
    payload: { sourceText: string; sourceLang: string; targetLang: string; context: string | null; customPrompt: string | null },
    traceId: string,
  ): Promise<ProviderResult200> {
    // IMPORTANT: use the correct env var name
    const apiKey = pickFirstEnv(
      'OPENAI_KIA_API_KEY',          // ✅ correct
      'OPENAI_API_KEY',              // fallback if used elsewhere
      'OPENAI_KIASPORA_API_KEY',     // legacy safety net
    );

    if (!apiKey) {
      throw new HttpError(500, 'Missing OPENAI_KIA_API_KEY', 'MISSING_OPENAI_KIA_API_KEY');
    }

    const model = pickFirstEnv('OPENAI_TRANSLATION_MODEL') || 'gpt-4o-mini';

    const started = Date.now();

    const system = `You are a translation engine. Follow instructions exactly.`;
    const user = [
      payload.context ? `Context:\n${payload.context}` : null,
      `Source language: ${payload.sourceLang}`,
      `Target language: ${payload.targetLang}`,
      `Text:\n${payload.sourceText}`,
      payload.customPrompt ? `Output format rules:\n${payload.customPrompt}` : null,
    ]
      .filter(Boolean)
      .join('\n\n');

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
        'x-trace-id': traceId,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.2,
      }),
    });

    const latency_ms = Date.now() - started;
    const rawText = await resp.text().catch(() => '');

    let parsed: any = {};
    try {
      parsed = rawText ? JSON.parse(rawText) : {};
    } catch {
      // non-json upstream
    }

    if (!resp.ok) {
      throw new HttpError(502, `OpenAI HTTP ${resp.status} ${resp.statusText || ''}`.trim(), 'OPENAI_HTTP_ERROR', {
        status: resp.status,
        bodySnippet: rawText.slice(0, 800),
      });
    }

    const content = parsed?.choices?.[0]?.message?.content ?? '';
    const translation = toCanonicalTranslationJsonString(String(content), payload.sourceText);

    return {
      translation,
      detected_source_lang: payload.sourceLang || 'auto',
      provider: 'openai',
      latency_ms,
      raw_provider_meta: {
        model,
        usage: parsed?.usage ?? null,
        id: parsed?.id ?? null,
      },
    };
  }

  private async callDeepSeek(
    payload: { sourceText: string; sourceLang: string; targetLang: string; context: string | null; customPrompt: string | null },
    traceId: string,
  ): Promise<ProviderResult200> {
    const apiKey = pickFirstEnv('DEEPSEEK_API_KEY', 'DEEPSEEK_API_KEY');
    if (!apiKey) throw new HttpError(500, 'Missing DEEPSEEK_API_KEY', 'MISSING_DEEPSEEK_API_KEY');

    const model = pickFirstEnv('DEEPSEEK_TRANSLATION_MODEL') || 'deepseek-chat';
    const started = Date.now();

    const user = [
      payload.context ? `Context:\n${payload.context}` : null,
      `Source language: ${payload.sourceLang}`,
      `Target language: ${payload.targetLang}`,
      `Text:\n${payload.sourceText}`,
      payload.customPrompt ? `Output format rules:\n${payload.customPrompt}` : null,
    ]
      .filter(Boolean)
      .join('\n\n');

    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
        'x-trace-id': traceId,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: user }],
        temperature: 0.2,
      }),
    });

    const latency_ms = Date.now() - started;
    const rawText = await resp.text().catch(() => '');
    let parsed: any = {};
    try {
      parsed = rawText ? JSON.parse(rawText) : {};
    } catch {}

    if (!resp.ok) {
      throw new HttpError(502, `DeepSeek HTTP ${resp.status} ${resp.statusText || ''}`.trim(), 'DEEPSEEK_HTTP_ERROR', {
        status: resp.status,
        bodySnippet: rawText.slice(0, 800),
      });
    }

    const content = parsed?.choices?.[0]?.message?.content ?? '';
    const translation = toCanonicalTranslationJsonString(String(content), payload.sourceText);

    return {
      translation,
      detected_source_lang: payload.sourceLang || 'auto',
      provider: 'deepseek',
      latency_ms,
      raw_provider_meta: { model, usage: parsed?.usage ?? null, id: parsed?.id ?? null },
    };
  }

  private async callGroq(
    payload: { sourceText: string; sourceLang: string; targetLang: string; context: string | null; customPrompt: string | null },
    traceId: string,
  ): Promise<ProviderResult200> {
    const apiKey = pickFirstEnv('GROQ_KIA_API_KEY', 'GROQ_API_KEY');
    if (!apiKey) throw new HttpError(500, 'Missing GROQ_KIA_API_KEY', 'MISSING_GROQ_KIA_API_KEY');

    const model = pickFirstEnv('GROQ_TRANSLATION_MODEL') || 'llama-3.1-8b-instant';
    const started = Date.now();

    const user = [
      payload.context ? `Context:\n${payload.context}` : null,
      `Source language: ${payload.sourceLang}`,
      `Target language: ${payload.targetLang}`,
      `Text:\n${payload.sourceText}`,
      payload.customPrompt ? `Output format rules:\n${payload.customPrompt}` : null,
    ]
      .filter(Boolean)
      .join('\n\n');

    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
        'x-trace-id': traceId,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: user }],
        temperature: 0.2,
      }),
    });

    const latency_ms = Date.now() - started;
    const rawText = await resp.text().catch(() => '');
    let parsed: any = {};
    try {
      parsed = rawText ? JSON.parse(rawText) : {};
    } catch {}

    if (!resp.ok) {
      throw new HttpError(502, `Groq HTTP ${resp.status} ${resp.statusText || ''}`.trim(), 'GROQ_HTTP_ERROR', {
        status: resp.status,
        bodySnippet: rawText.slice(0, 800),
      });
    }

    const content = parsed?.choices?.[0]?.message?.content ?? '';
    const translation = toCanonicalTranslationJsonString(String(content), payload.sourceText);

    return {
      translation,
      detected_source_lang: payload.sourceLang || 'auto',
      provider: 'groq',
      latency_ms,
      raw_provider_meta: { model, usage: parsed?.usage ?? null, id: parsed?.id ?? null },
    };
  }
}
