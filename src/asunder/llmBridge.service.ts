import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import {
  type NormalizedAttachment,
  normalizeAttachments,
  parseMultipartWithAttachments,
  type RequestedAttachment,
  type UploadedAttachment,
  validateRequestedAttachments,
} from '../common/attachments';

type ChatMessageRole = 'system' | 'developer' | 'user' | 'assistant' | 'tool';
type ChatMessage = {
  role: ChatMessageRole;
  [key: string]: unknown;
};

type PromptRef = {
  id?: string;
  version?: string;
};

const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;
const MAX_ATTACHMENTS = 5;
const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  'text/plain',
  'text/markdown',
  'application/json',
  'application/xml',
  'text/xml',
  'application/pdf',
]);

export type LlmBridgeRequest = {
  model?: string;
  messages?: ChatMessage[];
  input?: unknown;
  attachments?: RequestedAttachment[];
  prompt?: PromptRef;
  promptId?: string;
  promptVersion?: number;
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
  async parseMultipart(
    req: Request,
    traceId = 'llmBridge-trace',
  ): Promise<{
    body: LlmBridgeRequest;
    attachments: UploadedAttachment[];
  }> {
    return await parseMultipartWithAttachments({
      req,
      traceId,
      logPrefix: '[asunder.llmBridge]',
      maxAttachments: MAX_ATTACHMENTS,
      maxAttachmentBytes: MAX_ATTACHMENT_BYTES,
      validateBody: (value) => this.validateRequest(value),
      createError: (statusCode, message) =>
        this.invalidRequest(statusCode, message),
    });
  }

  async forward(
    requestBody: unknown,
    traceId: string,
    attachments: UploadedAttachment[] = [],
  ): Promise<globalThis.Response> {
    const body = this.validateRequest(requestBody);
    const config = this.getUpstreamConfig();
    const promptId = this.resolvePromptId(body.promptId, config.promptId);
    const promptVersion = this.resolvePromptVersion(body.promptVersion);
    const normalizedAttachments = await this.normalizeAttachments(
      body.attachments,
      attachments,
      traceId,
    );
    const upstreamBody = this.buildUpstreamPayload(
      body,
      config.defaultModel,
      promptId,
      promptVersion,
      normalizedAttachments,
    );

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
    const hasAttachments = body.attachments != null;

    if (!hasPrompt && !hasMessages && !hasInput && !hasAttachments) {
      throw new LlmBridgeError(
        400,
        'One of prompt, messages, input, or attachments is required',
        {
          error: {
            message:
              'One of prompt, messages, input, or attachments is required',
            type: 'invalid_request_error',
          },
        },
      );
    }

    if (
      body.model != null &&
      (typeof body.model !== 'string' || !body.model.trim())
    ) {
      throw new LlmBridgeError(
        400,
        'model must be a non-empty string when provided',
        {
          error: {
            message: 'model must be a non-empty string when provided',
            type: 'invalid_request_error',
          },
        },
      );
    }

    if (hasPrompt) {
      if (
        !body.prompt ||
        typeof body.prompt !== 'object' ||
        Array.isArray(body.prompt)
      ) {
        throw new LlmBridgeError(
          400,
          'prompt must be an object when provided',
          {
            error: {
              message: 'prompt must be an object when provided',
              type: 'invalid_request_error',
            },
          },
        );
      }

      const prompt = body.prompt as Record<string, unknown>;
      if (prompt.id != null) {
        throw new LlmBridgeError(
          400,
          'prompt.id must not be provided by the client',
          {
            error: {
              message: 'prompt.id must not be provided by the client',
              type: 'invalid_request_error',
            },
          },
        );
      }

      if (
        prompt.version != null &&
        typeof prompt.version !== 'string' &&
        typeof prompt.version !== 'number'
      ) {
        throw new LlmBridgeError(
          400,
          'prompt.version must be a string or number when provided',
          {
            error: {
              message:
                'prompt.version must be a string or number when provided',
              type: 'invalid_request_error',
            },
          },
        );
      }
    }

    if (
      body.promptId != null &&
      (typeof body.promptId !== 'string' || !body.promptId.trim())
    ) {
      throw new LlmBridgeError(
        400,
        'promptId must be a non-empty string when provided',
        {
          error: {
            message: 'promptId must be a non-empty string when provided',
            type: 'invalid_request_error',
          },
        },
      );
    }

    if (
      body.promptVersion != null &&
      (!Number.isInteger(body.promptVersion) || Number(body.promptVersion) < 1)
    ) {
      throw new LlmBridgeError(
        400,
        'promptVersion must be a positive integer when provided',
        {
          error: {
            message: 'promptVersion must be a positive integer when provided',
            type: 'invalid_request_error',
          },
        },
      );
    }

    if (hasMessages && !Array.isArray(body.messages)) {
      throw new LlmBridgeError(400, 'messages must be an array when provided', {
        error: {
          message: 'messages must be an array when provided',
          type: 'invalid_request_error',
        },
      });
    }

    for (const message of (body.messages as unknown[] | undefined) ?? []) {
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

    if (hasAttachments && !Array.isArray(body.attachments)) {
      throw this.invalidRequest(400, 'attachments must be an array when provided');
    }

    validateRequestedAttachments({
      attachments: body.attachments,
      maxAttachments: MAX_ATTACHMENTS,
      createError: (statusCode, message) =>
        this.invalidRequest(statusCode, message),
    });

    return body as LlmBridgeRequest;
  }

  private buildUpstreamPayload(
    body: LlmBridgeRequest,
    defaultModel?: string,
    promptId?: string,
    promptVersion?: string,
    attachments: NormalizedAttachment[] = [],
  ) {
    const payload: Record<string, unknown> = { ...body };
    delete payload.promptId;
    delete payload.promptVersion;
    delete payload.attachments;

    // Backward compatibility:
    // Existing callers send Chat Completions-style { model, messages, ... }.
    // New upstream is /v1/responses, so translate messages -> input.
    if (attachments.length > 0) {
      payload.input = this.buildResponsesInput(body, attachments);
      delete payload.messages;
    } else if (Array.isArray(payload.messages) && payload.input == null) {
      payload.input = this.buildResponsesInput(body, []);
      delete payload.messages;
    }

    // Chat Completions function tools are nested under "function".
    // Responses API expects function tool fields at the top level of each tool object.
    if (Array.isArray(payload.tools)) {
      payload.tools = payload.tools.map((tool) => {
        if (!tool || typeof tool !== 'object' || Array.isArray(tool)) {
          return tool;
        }

        const toolRecord = tool as Record<string, unknown>;
        if (toolRecord.type !== 'function') {
          return toolRecord;
        }

        const fn = toolRecord.function;
        if (!fn || typeof fn !== 'object' || Array.isArray(fn)) {
          return toolRecord;
        }

        const fnRecord = fn as Record<string, unknown>;
        return {
          ...toolRecord,
          ...fnRecord,
          function: undefined,
        };
      });
    }

    // If caller omitted model for prompt-based request, allow env default.
    if ((payload.model == null || payload.model === '') && defaultModel) {
      payload.model = defaultModel;
    }

    // gpt-5 family rejects temperature on the Responses API.
    if (typeof payload.model === 'string' && /^gpt-5/i.test(payload.model)) {
      delete payload.temperature;
    }

    // Responses API uses max_output_tokens, not max_tokens.
    if (payload.max_output_tokens == null && payload.max_tokens != null) {
      payload.max_output_tokens = payload.max_tokens;
      delete payload.max_tokens;
    }

    // Normalize prompt.version to string for consistency.
    const shouldAttachPromptConfig =
      (payload.prompt &&
        typeof payload.prompt === 'object' &&
        !Array.isArray(payload.prompt)) ||
      promptId ||
      promptVersion;

    if (shouldAttachPromptConfig) {
      if (
        !payload.prompt ||
        typeof payload.prompt !== 'object' ||
        Array.isArray(payload.prompt)
      ) {
        payload.prompt = {};
      }

      const prompt = payload.prompt as Record<string, unknown>;
      if (!promptId) {
        throw new LlmBridgeError(400, 'Missing prompt ID', {
          error: {
            message:
              'Missing prompt ID: neither request.promptId nor environment prompt ID is set',
            type: 'invalid_request_error',
          },
        });
      }

      prompt.id = promptId;
      if (promptVersion != null) {
        prompt.version = promptVersion;
      } else if (typeof prompt.version === 'number') {
        prompt.version = String(prompt.version);
      }
    }

    return payload;
  }

  private async normalizeAttachments(
    attachments: RequestedAttachment[] | undefined,
    uploadedAttachments: UploadedAttachment[],
    traceId: string,
  ): Promise<NormalizedAttachment[]> {
    return await normalizeAttachments({
      requestedAttachments: attachments,
      uploadedAttachments,
      traceId,
      logPrefix: '[asunder.llmBridge]',
      allowedMimeTypes: ALLOWED_ATTACHMENT_MIME_TYPES,
      maxAttachments: MAX_ATTACHMENTS,
      maxAttachmentBytes: MAX_ATTACHMENT_BYTES,
      createError: (statusCode, message) =>
        this.invalidRequest(statusCode, message),
    });
  }

  private buildResponsesInput(
    body: LlmBridgeRequest,
    attachments: NormalizedAttachment[],
  ) {
    if (body.messages?.length) {
      return body.messages.map((message) => ({
        role: message.role,
        content: this.buildMessageContent(
          message.content,
          message.role,
          attachments,
        ),
      }));
    }

    if (typeof body.input === 'string') {
      const content: Array<Record<string, string>> = [];
      if (body.input.trim()) {
        content.push({ type: 'input_text', text: body.input });
      }
      content.push(...this.buildFileContentItems(attachments));
      return [{ role: 'user', content }];
    }

    if (Array.isArray(body.input)) {
      return attachments.length > 0
        ? [...body.input, this.buildAttachmentInputMessage(attachments)]
        : body.input;
    }

    if (body.input && typeof body.input === 'object') {
      return attachments.length > 0
        ? [body.input, this.buildAttachmentInputMessage(attachments)]
        : body.input;
    }

    if (attachments.length > 0) {
      return [this.buildAttachmentInputMessage(attachments)];
    }

    throw this.invalidRequest(
      400,
      'Request must include input, messages, or attachments',
    );
  }

  private buildMessageContent(
    content: unknown,
    role: ChatMessageRole,
    attachments: NormalizedAttachment[],
  ) {
    const normalized = this.normalizeMessageContent(content);
    if (role === 'user' && attachments.length > 0) {
      normalized.push(...this.buildFileContentItems(attachments));
    }
    return normalized;
  }

  private normalizeMessageContent(content: unknown) {
    if (typeof content === 'string') {
      return [{ type: 'input_text', text: content }];
    }

    if (Array.isArray(content)) {
      return [...content];
    }

    if (content && typeof content === 'object') {
      return [content];
    }

    if (content == null) {
      return [];
    }

    return [{ type: 'input_text', text: String(content) }];
  }

  private buildFileContentItems(attachments: NormalizedAttachment[]) {
    return attachments.map((attachment) => ({
      type: 'input_file' as const,
      filename: attachment.filename,
      file_data: attachment.fileData,
    }));
  }

  private buildAttachmentInputMessage(attachments: NormalizedAttachment[]) {
    return {
      role: 'user',
      content: this.buildFileContentItems(attachments),
    };
  }

  private resolvePromptId(requestPromptId?: string, defaultPromptId?: string) {
    return requestPromptId?.trim() || defaultPromptId;
  }

  private resolvePromptVersion(requestPromptVersion?: number) {
    return requestPromptVersion != null
      ? String(requestPromptVersion)
      : undefined;
  }

  private invalidRequest(statusCode: number, message: string) {
    return new LlmBridgeError(statusCode, message, {
      error: {
        message,
        type: 'invalid_request_error',
      },
    });
  }

  private getUpstreamConfig() {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KIA_API_KEY;
    if (!apiKey) {
      throw new LlmBridgeError(500, 'OPENAI_API_KEY missing', {
        error: {
          message:
            'Server misconfigured: OPENAI_API_KEY (or OPENAI_KIA_API_KEY) missing',
          type: 'server_error',
        },
      });
    }

    const baseUrl = (
      process.env.ASUNDER_LLM_UPSTREAM_BASE_URL ?? 'https://api.openai.com'
    ).trim();
    const path = (
      process.env.ASUNDER_LLM_UPSTREAM_PATH ?? '/v1/responses'
    ).trim();
    const normalizedBase = baseUrl.replace(/\/+$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const defaultModel =
      (
        process.env.ASUNDER_LLM_DEFAULT_MODEL ||
        process.env.OPENAI_PROMPT_MODEL ||
        process.env.OPENAI_MODEL ||
        ''
      ).trim() || undefined;
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
        throw new LlmBridgeError(
          504,
          `Upstream request timed out after ${timeoutMs}ms`,
          {
            error: {
              message: `Upstream request timed out after ${timeoutMs}ms`,
              type: 'server_error',
            },
          },
        );
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
