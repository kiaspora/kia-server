import { Injectable } from '@nestjs/common';

type ChatMessageRole = 'system' | 'developer' | 'user' | 'assistant' | 'tool';
type ChatMessage = {
  role: ChatMessageRole;
  [key: string]: unknown;
};

type PromptRef = {
  id?: string;
  version?: string;
};

export type LlmBridgeRequest = {
  model?: string;
  messages?: ChatMessage[];
  input?: unknown;
  prompt?: PromptRef;
  stream?: boolean;
  [key: string]: unknown;
};

export class LlmBridgeError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly body?: unknown,
  ) {
    super(message);
  }
}

@Injectable()
export class LlmBridgeService {
  async forward(requestBody: unknown, traceId: string): Promise<globalThis.Response> {
    const body = this.validateRequest(requestBody);
    const config = this.getUpstreamConfig();
    const upstreamBody = this.buildUpstreamPayload(body, config.defaultModel, config.promptId);

    const response = await this.fetchWithTimeout(
      config.url,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${config.apiKey}`,
          'content-type': 'application/json',
          'x-trace-id': traceId,
        },
        body: JSON.stringify(upstreamBody),
      },
      60_000,
    );

    return response;
  }

  private validateRequest(value: unknown): LlmBridgeRequest {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new LlmBridgeError(400, 'Request body must be a JSON object', {
        error: {
          message: 'Request body must be a JSON object',
          type: 'invalid_request_error',
        },
      });
    }

    const body = value as Record<string, unknown>;
    const hasPrompt = body.prompt != null;
    const hasMessages = body.messages != null;
    const hasInput = body.input != null;

    if (!hasPrompt && !hasMessages && !hasInput) {
      throw new LlmBridgeError(
        400,
        'One of prompt, messages, or input is required',
        {
          error: {
            message: 'One of prompt, messages, or input is required',
            type: 'invalid_request_error',
          },
        },
      );
    }

    if (body.model != null && (typeof body.model !== 'string' || !body.model.trim())) {
      throw new LlmBridgeError(400, 'model must be a non-empty string when provided', {
        error: {
          message: 'model must be a non-empty string when provided',
          type: 'invalid_request_error',
        },
      });
    }

    if (hasPrompt) {
      if (!body.prompt || typeof body.prompt !== 'object' || Array.isArray(body.prompt)) {
        throw new LlmBridgeError(400, 'prompt must be an object when provided', {
          error: {
            message: 'prompt must be an object when provided',
            type: 'invalid_request_error',
          },
        });
      }

      const prompt = body.prompt as Record<string, unknown>;
      if (prompt.id != null) {
        throw new LlmBridgeError(400, 'prompt.id must not be provided by the client', {
          error: {
            message: 'prompt.id must not be provided by the client',
            type: 'invalid_request_error',
          },
        });
      }

      if (
        prompt.version != null &&
        typeof prompt.version !== 'string' &&
        typeof prompt.version !== 'number'
      ) {
        throw new LlmBridgeError(400, 'prompt.version must be a string or number when provided', {
          error: {
            message: 'prompt.version must be a string or number when provided',
            type: 'invalid_request_error',
          },
        });
      }
    }

    if (hasMessages && !Array.isArray(body.messages)) {
      throw new LlmBridgeError(400, 'messages must be an array when provided', {
        error: {
          message: 'messages must be an array when provided',
          type: 'invalid_request_error',
        },
      });
    }

    for (const message of ((body.messages as unknown[] | undefined) ?? [])) {
      if (!message || typeof message !== 'object' || Array.isArray(message)) {
        throw new LlmBridgeError(400, 'each message must be an object', {
          error: {
            message: 'each message must be an object',
            type: 'invalid_request_error',
          },
        });
      }

      const role = (message as Record<string, unknown>).role;
      if (
        role !== 'system' &&
        role !== 'developer' &&
        role !== 'user' &&
        role !== 'assistant' &&
        role !== 'tool'
      ) {
        throw new LlmBridgeError(
          400,
          'message.role must be one of: system, developer, user, assistant, tool',
          {
            error: {
              message:
                'message.role must be one of: system, developer, user, assistant, tool',
              type: 'invalid_request_error',
            },
          },
        );
      }
    }

    if (body.stream != null && typeof body.stream !== 'boolean') {
      throw new LlmBridgeError(400, 'stream must be a boolean when provided', {
        error: {
          message: 'stream must be a boolean when provided',
          type: 'invalid_request_error',
        },
      });
    }

    return body as LlmBridgeRequest;
  }

  private buildUpstreamPayload(
    body: LlmBridgeRequest,
    defaultModel?: string,
    promptId?: string,
  ) {
    const payload: Record<string, unknown> = { ...body };

    // Backward compatibility:
    // Existing callers send Chat Completions-style { model, messages, ... }.
    // New upstream is /v1/responses, so translate messages -> input.
    if (Array.isArray(payload.messages) && payload.input == null) {
      payload.input = payload.messages;
      delete payload.messages;
    }

    // If caller omitted model for prompt-based request, allow env default.
    if ((payload.model == null || payload.model === '') && defaultModel) {
      payload.model = defaultModel;
    }

    // Responses API uses max_output_tokens, not max_tokens.
    if (payload.max_output_tokens == null && payload.max_tokens != null) {
      payload.max_output_tokens = payload.max_tokens;
      delete payload.max_tokens;
    }

    // Normalize prompt.version to string for consistency.
    if (payload.prompt && typeof payload.prompt === 'object' && !Array.isArray(payload.prompt)) {
      const prompt = payload.prompt as Record<string, unknown>;
      if (!promptId) {
        throw new LlmBridgeError(500, 'Prompt ID env missing', {
          error: {
            message:
              'Server misconfigured: prompt ID env missing for prompt-based request',
            type: 'server_error',
          },
        });
      }

      prompt.id = promptId;
      if (typeof prompt.version === 'number') {
        prompt.version = String(prompt.version);
      }
    }

    return payload;
  }

  private getUpstreamConfig() {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KIA_API_KEY;
    if (!apiKey) {
      throw new LlmBridgeError(500, 'OPENAI_API_KEY missing', {
        error: {
          message: 'Server misconfigured: OPENAI_API_KEY (or OPENAI_KIA_API_KEY) missing',
          type: 'server_error',
        },
      });
    }

    const baseUrl = (process.env.ASUNDER_LLM_UPSTREAM_BASE_URL ?? 'https://api.openai.com').trim();
    const path = (process.env.ASUNDER_LLM_UPSTREAM_PATH ?? '/v1/responses').trim();
    const normalizedBase = baseUrl.replace(/\/+$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const defaultModel =
      (process.env.ASUNDER_LLM_DEFAULT_MODEL ||
        process.env.OPENAI_PROMPT_MODEL ||
        process.env.OPENAI_MODEL ||
        '').trim() || undefined;
    const promptId =
      (
        process.env.OPENAI_ARCHETYPE_PROMP_ID ||
        process.env.OPENAI_PROMPT_ID ||
        process.env.ASUNDER_LLM_PROMPT_ID ||
        ''
      ).trim() || undefined;

    return {
      apiKey,
      url: `${normalizedBase}${normalizedPath}`,
      defaultModel,
      promptId,
    };
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeoutMs: number,
  ): Promise<globalThis.Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        throw new LlmBridgeError(504, `Upstream request timed out after ${timeoutMs}ms`, {
          error: {
            message: `Upstream request timed out after ${timeoutMs}ms`,
            type: 'server_error',
          },
        });
      }

      throw new LlmBridgeError(502, 'Failed to reach upstream LLM provider', {
        error: {
          message: 'Failed to reach upstream LLM provider',
          type: 'server_error',
        },
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}
