import { Injectable } from '@nestjs/common';

type LlmProvider = 'deepseek' | 'openai';

type RouterPayload = {
  provider?: unknown;
  input?: unknown;
  system?: unknown;
  metadata?: unknown;
};

type NormalizedRequest = {
  provider: LlmProvider | null;
  input: string;
  system: string | null;
  metadata: Record<string, unknown> | null;
};

type ProviderResult = {
  provider: LlmProvider;
  model: string;
  trace_id: string;
  output_text: string;
  raw_provider_meta: {
    status: number;
    headers: {
      'x-request-id': string | null;
    };
    body: unknown;
  };
};

type RouteSuccess = {
  statusCode: number;
  body: ProviderResult;
};

type RouteFailure = {
  statusCode: number;
  body: {
    errors: string[];
    trace_id: string;
    details?: unknown;
  };
};

export type LlmRouterResult = RouteSuccess | RouteFailure;

class HttpError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly details: unknown = null,
  ) {
    super(message);
  }
}

@Injectable()
export class LlmRouterService {
  async route(rawBody: string | undefined, traceId: string): Promise<LlmRouterResult> {
    try {
      const payload = this.parseJsonBody(rawBody);
      const request = this.validateRequestPayload(payload);

      if (request.provider === 'deepseek') {
        const response = await this.callDeepseek(request, traceId);
        return { statusCode: 200, body: response };
      }

      if (request.provider === 'openai') {
        const response = await this.callOpenAi(request, traceId);
        return { statusCode: 200, body: response };
      }

      try {
        const response = await this.callDeepseek(request, traceId);
        return { statusCode: 200, body: response };
      } catch {
        // no-op: fallback to OpenAI
      }

      const response = await this.callOpenAi(request, traceId);
      return { statusCode: 200, body: response };
    } catch (error: any) {
      if (error instanceof HttpError) {
        return {
          statusCode: error.statusCode,
          body: {
            errors: [error.message],
            trace_id: traceId,
            ...(error.details != null ? { details: error.details } : {}),
          },
        };
      }

      return {
        statusCode: 500,
        body: {
          errors: [
            'Internal server error',
            ...(error?.message ? [String(error.message)] : []),
          ],
          trace_id: traceId,
          details: {
            name: error?.name ?? null,
            stack: error?.stack ?? null,
          },
        },
      };
    }
  }

  private parseJsonBody(rawBody: string | undefined): RouterPayload {
    if (!rawBody) return {};

    try {
      return JSON.parse(rawBody) as RouterPayload;
    } catch {
      throw new HttpError(400, 'Invalid JSON body');
    }
  }

  private validateRequestPayload(payload: RouterPayload): NormalizedRequest {
    const { provider, input, system, metadata } = payload;

    if (!input || typeof input !== 'string') {
      throw new HttpError(400, 'input is required and must be a string');
    }

    if (system != null && typeof system !== 'string') {
      throw new HttpError(400, 'system must be a string when provided');
    }

    if (metadata != null && typeof metadata !== 'object') {
      throw new HttpError(400, 'metadata must be an object when provided');
    }

    let normalizedProvider: LlmProvider | null = null;
    if (provider != null) {
      if (typeof provider !== 'string') {
        throw new HttpError(400, 'provider must be a string when provided');
      }

      const lower = provider.toLowerCase();
      if (lower !== 'deepseek' && lower !== 'openai') {
        throw new HttpError(400, 'provider must be "deepseek" or "openai"');
      }
      normalizedProvider = lower;
    }

    return {
      provider: normalizedProvider,
      input,
      system: system ?? null,
      metadata: (metadata as Record<string, unknown> | null) ?? null,
    };
  }

  private async callDeepseek(request: NormalizedRequest, traceId: string): Promise<ProviderResult> {
    const config = this.getDeepseekConfig();
    const messages = [
      ...(request.system ? [{ role: 'system', content: request.system }] : []),
      { role: 'user', content: request.input },
    ];

    const response = await this.fetchWithTimeout(
      config.baseUrl,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${config.key}`,
          'x-trace-id': traceId,
        },
        body: JSON.stringify({
          model: config.model,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          messages,
        }),
      },
      10_000,
    );

    const { json, text } = await this.readJsonSafe(response);
    if (!response.ok) {
      throw new HttpError(502, `DeepSeek HTTP ${response.status}`, { body: json ?? text });
    }

    const normalized = this.normalizeProviderResponse('deepseek', response, json ?? {});
    return {
      provider: 'deepseek',
      model: config.model,
      trace_id: traceId,
      ...normalized,
    };
  }

  private async callOpenAi(request: NormalizedRequest, traceId: string): Promise<ProviderResult> {
    const config = this.getOpenAiConfig();
    const input = [
      ...(request.system ? [{ role: 'system', content: request.system }] : []),
      { role: 'user', content: request.input },
    ];

    const response = await this.fetchWithTimeout(
      config.baseUrl,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${config.key}`,
          'x-trace-id': traceId,
        },
        body: JSON.stringify({
          model: config.model,
          input,
          temperature: config.temperature,
          max_output_tokens: config.maxOutputTokens,
        }),
      },
      25_000,
    );

    const { json, text } = await this.readJsonSafe(response);
    if (!response.ok) {
      throw new HttpError(502, `OpenAI HTTP ${response.status}`, { body: json ?? text });
    }

    const normalized = this.normalizeProviderResponse('openai', response, json ?? {});
    return {
      provider: 'openai',
      model: config.model,
      trace_id: traceId,
      ...normalized,
    };
  }

  private getDeepseekConfig() {
    const key = process.env.DEEPSEEK_API_KEY;
    const baseUrl = process.env.DEEPSEEK_URL;
    const model = process.env.DEEPSEEK_PROMPT_MODEL ?? 'deepseek-chat';
    const temperature = this.parseNumber(process.env.DEEPSEEK_TEMPERATURE, 0.7);
    const maxTokens = this.parseInteger(process.env.DEEPSEEK_MAX_TOKENS, 1024);

    if (!key) throw new HttpError(500, 'DEEPSEEK_API_KEY missing');
    if (!baseUrl) throw new HttpError(500, 'DEEPSEEK_URL missing');

    return { key, baseUrl, model, temperature, maxTokens };
  }

  private getOpenAiConfig() {
    const key = process.env.OPENAI_KIA_API_KEY;
    const baseUrl = 'https://api.openai.com/v1/responses';
    const model = process.env.OPENAI_PROMPT_MODEL ?? 'gpt-4.1-mini';
    const temperature = this.parseNumber(process.env.OPENAI_TEMPERATURE, 0.7);
    const maxOutputTokens = this.parseInteger(process.env.OPENAI_MAX_OUTPUT_TOKENS, 1024);

    if (!key) throw new HttpError(500, 'OPENAI_KIA_API_KEY missing');

    return { key, baseUrl, model, temperature, maxOutputTokens };
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeoutMs: number,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        throw new HttpError(504, `Provider request timed out after ${timeoutMs}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async readJsonSafe(
    response: Response,
  ): Promise<{ json: Record<string, unknown> | null; text: string }> {
    const text = await response.text().catch(() => '');
    if (!text) return { json: null, text: '' };

    try {
      return { json: JSON.parse(text) as Record<string, unknown>, text };
    } catch {
      return { json: null, text };
    }
  }

  private normalizeProviderResponse(
    provider: LlmProvider,
    response: Response,
    body: Record<string, unknown>,
  ) {
    const outputText = this.extractTextFromProviderBody(body);
    if (!outputText) {
      throw new HttpError(502, `Provider ${provider} returned no recognizable text field`);
    }

    return {
      output_text: outputText,
      raw_provider_meta: {
        status: response.status,
        headers: {
          'x-request-id': response.headers.get('x-request-id'),
        },
        body,
      },
    };
  }

  private extractTextFromProviderBody(body: Record<string, unknown> | null): string | null {
    if (!body) return null;

    const outputText = body.output_text;
    if (typeof outputText === 'string' && outputText.trim()) return outputText.trim();

    const output = body.output;
    if (Array.isArray(output) && output.length > 0) {
      const first = output[0] as Record<string, unknown> | null;
      const content = first?.content;

      if (Array.isArray(content)) {
        const parts: string[] = [];
        for (const blockUnknown of content) {
          const block = blockUnknown as Record<string, unknown> | null;
          if (!block) continue;

          if (typeof block.text === 'string') parts.push(block.text);

          const textObj = block.text as Record<string, unknown> | undefined;
          if (textObj && typeof textObj.value === 'string') parts.push(textObj.value);

          if (typeof block.content === 'string') parts.push(block.content);

          const contentObj = block.content as Record<string, unknown> | undefined;
          if (contentObj && typeof contentObj.value === 'string') parts.push(contentObj.value);
        }

        const joined = parts.join('').trim();
        if (joined) return joined;
      }
    }

    const chatCompletion = (body.choices as any)?.[0]?.message?.content;
    if (typeof chatCompletion === 'string' && chatCompletion.trim()) {
      return chatCompletion.trim();
    }

    const fallback = body.text ?? body.output ?? body.result ?? body.response ?? null;
    if (typeof fallback === 'string' && fallback.trim()) return fallback.trim();

    return null;
  }

  private parseNumber(value: string | undefined, fallback: number): number {
    if (!value) return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private parseInteger(value: string | undefined, fallback: number): number {
    if (!value) return fallback;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
}
