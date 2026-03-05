import { Injectable } from '@nestjs/common';

type ChatMessageRole = 'system' | 'developer' | 'user' | 'assistant' | 'tool';
type ChatMessage = {
  role: ChatMessageRole;
  [key: string]: unknown;
};

export type LlmBridgeRequest = {
  model: string;
  messages: ChatMessage[];
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

    const response = await this.fetchWithTimeout(
      config.url,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${config.apiKey}`,
          'content-type': 'application/json',
          'x-trace-id': traceId,
        },
        body: JSON.stringify(body),
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

    if (typeof body.model !== 'string' || !body.model.trim()) {
      throw new LlmBridgeError(400, 'model is required and must be a non-empty string', {
        error: {
          message: 'model is required and must be a non-empty string',
          type: 'invalid_request_error',
        },
      });
    }

    if (!Array.isArray(body.messages)) {
      throw new LlmBridgeError(400, 'messages is required and must be an array', {
        error: {
          message: 'messages is required and must be an array',
          type: 'invalid_request_error',
        },
      });
    }

    for (const message of body.messages) {
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
    const path = (process.env.ASUNDER_LLM_UPSTREAM_PATH ?? '/v1/chat/completions').trim();
    const normalizedBase = baseUrl.replace(/\/+$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return {
      apiKey,
      url: `${normalizedBase}${normalizedPath}`,
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
