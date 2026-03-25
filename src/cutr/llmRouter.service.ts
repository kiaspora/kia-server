import { Injectable } from '@nestjs/common';

type Provider = 'deepseek' | 'groq' | 'openai';
type Archetype =
  | 'none'
  | 'Analyst'
  | 'Strategist'
  | 'Builder'
  | 'Operator'
  | 'Reviewer'
  | 'Facilitator';

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type LlmRouterRequest = {
  provider: Provider;
  stream: boolean;
  archetype: Archetype;
  messages: Message[];
  traceId: string;
  promptId?: string;
  promptVersion?: number;
};

type ProviderResult = {
  content: string;
  provider: Provider;
  latency_ms: number;
  raw_provider_meta: any;
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

const VALID_PROVIDERS: Provider[] = ['deepseek', 'groq', 'openai'];
const VALID_ARCHETYPES: Archetype[] = [
  'none',
  'Analyst',
  'Strategist',
  'Builder',
  'Operator',
  'Reviewer',
  'Facilitator',
];

@Injectable()
export class LlmRouterService {
  async handle(body: any, traceId: string): Promise<ProviderResult> {
    const validated = this.validate(body);

    const payload: LlmRouterRequest = {
      ...validated,
      traceId,
    };

    if (validated.provider === 'deepseek') {
      try {
        return await this.callDeepSeek(payload);
      } catch (err: any) {
        throw new HttpError(
          502,
          'DeepSeek is currently unavailable; please try again later',
          'DEEPSEEK_UNAVAILABLE',
          { message: String(err?.message ?? err) },
        );
      }
    }

    if (validated.provider === 'groq') {
      try {
        return await this.callGroq(payload);
      } catch (err: any) {
        throw new HttpError(
          502,
          'Groq is currently unavailable; please try again later',
          'GROQ_UNAVAILABLE',
          { message: String(err?.message ?? err) },
        );
      }
    }

    if (validated.provider === 'openai') {
      try {
        return await this.callOpenAI(payload);
      } catch (err: any) {
        throw new HttpError(
          502,
          'OpenAI is currently unavailable; please try again later',
          'OPENAI_UNAVAILABLE',
          { message: String(err?.message ?? err) },
        );
      }
    }

    throw new HttpError(400, 'Invalid provider', 'INVALID_PROVIDER');
  }

  private validate(body: any): Omit<LlmRouterRequest, 'traceId'> {
    if (!body || typeof body !== 'object') {
      throw new HttpError(400, 'Request body is required', 'MISSING_BODY');
    }

    const providerRaw = body.provider;
    if (!isNonEmptyString(providerRaw)) {
      throw new HttpError(
        400,
        'Missing required field: provider',
        'MISSING_PROVIDER',
      );
    }
    const provider = providerRaw.toLowerCase().trim() as Provider;
    if (!VALID_PROVIDERS.includes(provider)) {
      throw new HttpError(
        400,
        'provider must be "deepseek", "groq", or "openai"',
        'INVALID_PROVIDER',
      );
    }

    const stream = typeof body.stream === 'boolean' ? body.stream : false;

    const archetypeRaw = body.archetype;
    let archetype: Archetype = 'none';
    if (isNonEmptyString(archetypeRaw)) {
      const trimmed = archetypeRaw.trim();
      if (VALID_ARCHETYPES.includes(trimmed as Archetype)) {
        archetype = trimmed as Archetype;
      }
    }

    const messagesRaw = body.messages;
    if (!Array.isArray(messagesRaw) || messagesRaw.length === 0) {
      throw new HttpError(
        400,
        'Missing required field: messages (non-empty array)',
        'MISSING_MESSAGES',
      );
    }
    const messages: Message[] = messagesRaw.map((m: any, idx: number) => {
      if (!m || typeof m !== 'object') {
        throw new HttpError(
          400,
          `messages[${idx}] must be an object`,
          'INVALID_MESSAGE',
        );
      }
      const role = m.role;
      if (role !== 'system' && role !== 'user' && role !== 'assistant') {
        throw new HttpError(
          400,
          `messages[${idx}].role must be "system", "user", or "assistant"`,
          'INVALID_MESSAGE_ROLE',
        );
      }
      const content = m.content;
      if (typeof content !== 'string') {
        throw new HttpError(
          400,
          `messages[${idx}].content must be a string`,
          'INVALID_MESSAGE_CONTENT',
        );
      }
      return { role, content };
    });

    const promptId = body.promptId;
    const promptVersion = body.promptVersion;

    return {
      provider,
      stream,
      archetype,
      messages,
      ...(typeof promptId === 'string' ? { promptId } : {}),
      ...(typeof promptVersion === 'number' ? { promptVersion } : {}),
    };
  }

  private async callOpenAI(payload: LlmRouterRequest): Promise<ProviderResult> {
    const apiKey = pickFirstEnv('OPENAI_ARCHETYPE_API_KEY', 'OPENAI_API_KEY');
    if (!apiKey) {
      throw new HttpError(
        500,
        'Missing OPENAI_ARCHETYPE_API_KEY',
        'MISSING_OPENAI_API_KEY',
      );
    }

    const model = pickFirstEnv('OPENAI_MODEL') || 'gpt-4o-mini';
    const started = Date.now();

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
        'x-trace-id': payload.traceId,
      },
      body: JSON.stringify({
        model,
        messages: payload.messages,
        temperature: 0.7,
        stream: payload.stream,
      }),
    });

    const latency_ms = Date.now() - started;
    const rawText = await resp.text().catch(() => '');

    let parsed: any = {};
    try {
      parsed = rawText ? JSON.parse(rawText) : {};
    } catch {}

    if (!resp.ok) {
      throw new HttpError(
        502,
        `OpenAI HTTP ${resp.status} ${resp.statusText || ''}`.trim(),
        'OPENAI_HTTP_ERROR',
        {
          status: resp.status,
          bodySnippet: rawText.slice(0, 800),
        },
      );
    }

    const content = parsed?.choices?.[0]?.message?.content ?? '';

    return {
      content: String(content),
      provider: 'openai',
      latency_ms,
      raw_provider_meta: {
        model,
        usage: parsed?.usage ?? null,
        id: parsed?.id ?? null,
        promptId: payload.promptId,
        promptVersion: payload.promptVersion,
      },
    };
  }

  private async callDeepSeek(
    payload: LlmRouterRequest,
  ): Promise<ProviderResult> {
    const apiKey = pickFirstEnv('DEEPSEEK_API_KEY');
    if (!apiKey)
      throw new HttpError(
        500,
        'Missing DEEPSEEK_API_KEY',
        'MISSING_DEEPSEEK_API_KEY',
      );

    const model = pickFirstEnv('DEEPSEEK_MODEL') || 'deepseek-chat';
    const started = Date.now();

    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
        'x-trace-id': payload.traceId,
      },
      body: JSON.stringify({
        model,
        messages: payload.messages,
        temperature: 0.7,
        stream: payload.stream,
      }),
    });

    const latency_ms = Date.now() - started;
    const rawText = await resp.text().catch(() => '');
    let parsed: any = {};
    try {
      parsed = rawText ? JSON.parse(rawText) : {};
    } catch {}

    if (!resp.ok) {
      throw new HttpError(
        502,
        `DeepSeek HTTP ${resp.status} ${resp.statusText || ''}`.trim(),
        'DEEPSEEK_HTTP_ERROR',
        {
          status: resp.status,
          bodySnippet: rawText.slice(0, 800),
        },
      );
    }

    const content = parsed?.choices?.[0]?.message?.content ?? '';

    return {
      content: String(content),
      provider: 'deepseek',
      latency_ms,
      raw_provider_meta: {
        model,
        usage: parsed?.usage ?? null,
        id: parsed?.id ?? null,
      },
    };
  }

  private async callGroq(payload: LlmRouterRequest): Promise<ProviderResult> {
    const apiKey = pickFirstEnv('GROQ_API_KEY', 'GROQ_KIA_API_KEY');
    if (!apiKey)
      throw new HttpError(500, 'Missing GROQ_API_KEY', 'MISSING_GROQ_API_KEY');

    const model = pickFirstEnv('GROQ_MODEL') || 'llama-3.1-8b-instant';
    const started = Date.now();

    const resp = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
          'x-trace-id': payload.traceId,
        },
        body: JSON.stringify({
          model,
          messages: payload.messages,
          temperature: 0.7,
          stream: payload.stream,
        }),
      },
    );

    const latency_ms = Date.now() - started;
    const rawText = await resp.text().catch(() => '');
    let parsed: any = {};
    try {
      parsed = rawText ? JSON.parse(rawText) : {};
    } catch {}

    if (!resp.ok) {
      throw new HttpError(
        502,
        `Groq HTTP ${resp.status} ${resp.statusText || ''}`.trim(),
        'GROQ_HTTP_ERROR',
        {
          status: resp.status,
          bodySnippet: rawText.slice(0, 800),
        },
      );
    }

    const content = parsed?.choices?.[0]?.message?.content ?? '';

    return {
      content: String(content),
      provider: 'groq',
      latency_ms,
      raw_provider_meta: {
        model,
        usage: parsed?.usage ?? null,
        id: parsed?.id ?? null,
      },
    };
  }
}
