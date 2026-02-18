import { Injectable } from '@nestjs/common';

type ChatProvider = 'deepseek' | 'openai' | 'groq';

type TranslationChatBody = {
  aiProvider?: string | null; // legacy
  provider?: string | null;   // new
  messages?: unknown;
  sourceLang?: unknown;
  targetLang?: unknown;
  context?: unknown;
  traceId?: unknown;
  customPrompt?: unknown;
};

class HttpError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
  }
}

const OPENAI_BASE_URL =
  process.env.OPENAI_API_URL || 'https://api.openai.com/v1/responses';
const DEEPSEEK_BASE_URL =
  process.env.DEEPSEEK_URL || 'https://api.deepseek.com/chat/completions';

const OPENAI_MODEL = process.env.OPENAI_PROMPT_MODEL || 'gpt-5-nano';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_PROMPT_MODEL || 'deepseek-chat';

function requireEnv(name: string, forMsg: string): string {
  const v = (process.env[name] ?? '').trim().replace(/^["']|["']$/g, '');
  if (!v) throw new HttpError(500, `Server misconfigured: missing ${name} for ${forMsg}`);
  return v;
}

function parseBody(raw: any): TranslationChatBody {
  // Nest will already parse JSON, but keep parity with the Cloud Function:
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

function validateBody(payload: TranslationChatBody) {
  const {
    aiProvider: rawAiProvider,
    provider: rawProvider,
    messages,
    traceId = '',
    customPrompt = '',
    sourceLang = '',
    targetLang = '',
    context = '',
  } = payload;

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new HttpError(400, 'messages[] required');
  }

  // provider selection precedence:
  // 1) provider (new)
  // 2) aiProvider (legacy)
  const raw = rawProvider ?? rawAiProvider ?? null;

  let aiProvider: ChatProvider = 'deepseek';
  if (raw != null) {
    if (typeof raw !== 'string') {
      throw new HttpError(400, "Invalid provider. Use 'openai', 'deepseek', or 'groq'.");
    }
    const lower = raw.toLowerCase().trim();
    if (lower !== 'openai' && lower !== 'deepseek' && lower !== 'groq') {
      throw new HttpError(400, "Invalid provider. Use 'openai', 'deepseek', or 'groq'.");
    }
    aiProvider = lower as ChatProvider;
  }

  return {
    aiProvider,
    messages: messages as any[],
    sourceLang,
    targetLang,
    context,
    traceId: typeof traceId === 'string' ? traceId : '',
    customPrompt: typeof customPrompt === 'string' ? customPrompt : '',
  };
}

function buildAnswer(body: any): string {
  let answer =
    body?.choices?.[0]?.message?.content?.trim?.() ||
    body?.output_text ||
    '';

  if (!answer && Array.isArray(body?.output)) {
    const parts: string[] = [];
    for (const item of body.output) {
      for (const block of item?.content || []) {
        if (typeof block?.text?.value === 'string') parts.push(block.text.value);
        else if (typeof block?.text === 'string') parts.push(block.text);
      }
    }
    answer = parts.join('').trim();
  }

  return answer || '';
}

@Injectable()
export class TranslationChatService {
  async run(rawBody: TranslationChatBody, traceId: string) {
    const startedAll = Date.now();

    try {
      const validated = validateBody(parseBody(rawBody));
      const { aiProvider, messages, customPrompt } = validated;

      const response = await this.callProvider({
        aiProvider,
        messages,
        customPrompt,
        traceId,
      });

      // Keep EXACT output shape
      return response;
    } catch (e: any) {
      // Keep error semantics compatible:
      // - preserve 400/405 style errors as HttpError where possible
      // - otherwise 500
      // NOTE: If your project uses a global exception filter, this can be simplified.
      const statusCode = e instanceof HttpError ? e.statusCode : 500;
      const msg = String(e?.message ?? e);

      // Cloud Function used sendError(); without that infra here, throw HttpError
      // and let Nest global filters map it.
      throw new HttpError(statusCode, msg);
    } finally {
      const durationMs = Date.now() - startedAll;
      // Keep log payload similar (no firebase uid here)
      console.log(
        JSON.stringify({
          level: 'info',
          msg: 'translationChat',
          traceId,
          durationMs,
        }),
      );
    }
  }

  private async callProvider(args: {
    aiProvider: ChatProvider;
    messages: any[];
    customPrompt: string;
    traceId: string;
  }) {
    const { aiProvider, messages, customPrompt, traceId } = args;

    // Groq: preserve the same “joined messages” adaptation
    if (aiProvider === 'groq') {
      // IMPORTANT: if your existing NestJS code already has a groq service,
      // swap this section to call it. For now this mirrors the function behavior
      // without importing firebase code.

      const joined = messages
        .map((m) => {
          const role = typeof m?.role === 'string' ? m.role : 'user';
          const content =
            typeof m?.content === 'string'
              ? m.content
              : typeof m?.content?.text === 'string'
                ? m.content.text
                : '';
          return content ? `${role}: ${content}` : '';
        })
        .filter(Boolean)
        .join('\n\n');

      const groqKey = requireEnv('GROQ_API_KEY', 'groq provider');

      const started = Date.now();
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
          messages: [
            ...(customPrompt?.trim()
              ? [{ role: 'system', content: customPrompt.trim() }]
              : []),
            { role: 'user', content: joined },
          ],
        }),
      });
      const latency_ms = Date.now() - started;

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Upstream groq error: HTTP ${res.status} ${res.statusText} ${text}`);
      }

      const json = await res.json().catch(() => ({}));
      const answer = buildAnswer(json);

      return { reply: answer || '', traceId, aiProvider: 'groq', latency_ms };
    }

    // OpenAI / DeepSeek (same as function)
    let baseUrl: string;
    let apiKey: string;
    let model: string;

    if (aiProvider === 'openai') {
      apiKey = requireEnv('OPENAI_KIA_API_KEY', 'openai provider');
      model = process.env.OPENAI_PROMPT_MODEL || OPENAI_MODEL;
      baseUrl = OPENAI_BASE_URL;
      if (!model) {
        throw new HttpError(500, 'Server misconfigured: missing OPENAI_PROMPT_MODEL for openai provider');
      }
    } else {
      apiKey = requireEnv('DEEPSEEK_API_KEY', 'deepseek provider');
      model = process.env.DEEPSEEK_PROMPT_MODEL || DEEPSEEK_MODEL;
      baseUrl = DEEPSEEK_BASE_URL;
    }

    const trimmedPrompt = (customPrompt ?? '').trim();
    const systemMessages = trimmedPrompt
      ? [{ role: 'system', content: trimmedPrompt }]
      : [];

    const payloadMessages = [...systemMessages, ...messages];

    const requestPayload =
      aiProvider === 'openai'
        ? { model, input: payloadMessages }
        : { model, messages: payloadMessages };

    const started = Date.now();
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestPayload),
    });
    const latency_ms = Date.now() - started;

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(
        `Upstream ${aiProvider} error: HTTP ${res.status} ${res.statusText} ${text}`,
      );
    }

    const json = await res.json().catch(() => ({}));
    const answer = buildAnswer(json);

    return { reply: answer || '', traceId, aiProvider, latency_ms };
  }
}
