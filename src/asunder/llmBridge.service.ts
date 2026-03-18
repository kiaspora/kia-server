import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import Busboy from 'busboy';

type ChatMessageRole = 'system' | 'developer' | 'user' | 'assistant' | 'tool';
type ChatMessage = {
  role: ChatMessageRole;
  [key: string]: unknown;
};

type PromptRef = {
  id?: string;
  version?: string;
};

export type UploadedAttachment = {
  filename: string;
  mimeType: string;
  buffer: Buffer;
  size: number;
};

type ResponseInputMessage = {
  role: string;
  content: unknown;
  [key: string]: unknown;
};

const OPENAI_FILE_MAX_BYTES = 512 * 1024 * 1024;
const MAX_ATTACHMENTS = 5;

export type LlmBridgeRequest = {
  model?: string;
  messages?: ChatMessage[];
  input?: unknown;
  prompt?: PromptRef;
  promptId?: string;
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
  async parseMultipart(req: Request): Promise<{
    body: LlmBridgeRequest;
    attachments: UploadedAttachment[];
  }> {
    return await new Promise((resolve, reject) => {
      const bb = Busboy({
        headers: req.headers as Busboy.BusboyConfig['headers'],
        limits: {
          files: MAX_ATTACHMENTS,
          fileSize: OPENAI_FILE_MAX_BYTES,
        },
      });

      const attachments: UploadedAttachment[] = [];
      let payloadField: string | undefined;

      bb.on('field', (name, value) => {
        if (name === 'payload') {
          payloadField = value;
        }
      });

      bb.on('file', (name, file, info) => {
        if (name !== 'file' && name !== 'files') {
          file.resume();
          return;
        }

        const filename = info.filename?.trim() || 'upload.bin';
        const mimeType = info.mimeType || 'application/octet-stream';
        const chunks: Buffer[] = [];
        let total = 0;

        file.on('data', (chunk: Buffer) => {
          total += chunk.length;
          if (total > OPENAI_FILE_MAX_BYTES) {
            reject(this.invalidRequest(413, 'Uploaded file is too large'));
            file.resume();
            return;
          }

          chunks.push(chunk);
        });

        file.on('limit', () => reject(this.invalidRequest(413, 'Uploaded file is too large')));
        file.on('end', () => {
          if (total === 0) {
            reject(this.invalidRequest(400, `Uploaded file "${filename}" is empty`));
            return;
          }

          attachments.push({
            filename,
            mimeType,
            buffer: Buffer.concat(chunks),
            size: total,
          });
        });
        file.on('error', () => reject(this.invalidRequest(400, 'Failed to read uploaded file')));
      });

      bb.on('filesLimit', () =>
        reject(this.invalidRequest(400, `Too many files. Maximum ${MAX_ATTACHMENTS} allowed`)),
      );
      bb.on('error', () => reject(this.invalidRequest(400, 'Invalid multipart/form-data payload')));
      bb.on('finish', () => {
        if (payloadField == null || !payloadField.trim()) {
          reject(this.invalidRequest(400, 'Missing payload field'));
          return;
        }

        let parsedPayload: unknown;
        try {
          parsedPayload = JSON.parse(payloadField);
        } catch {
          reject(this.invalidRequest(400, 'payload must be valid JSON'));
          return;
        }

        resolve({
          body: this.validateRequest(parsedPayload),
          attachments,
        });
      });

      const raw: unknown = (req as any).rawBody ?? (req as any).body;
      if (Buffer.isBuffer(raw)) bb.end(raw);
      else req.pipe(bb);
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
    this.validateAttachmentCompatibility(body, attachments);
    const fileIds =
      attachments.length > 0
        ? await Promise.all(
            attachments.map((attachment) =>
              this.uploadFileToOpenAI(attachment, traceId, config.apiKey, config.filesUrl),
            ),
          )
        : [];
    const upstreamBody = this.buildUpstreamPayload(body, config.defaultModel, promptId, fileIds);

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

    if (
      body.promptId != null &&
      (typeof body.promptId !== 'string' || !body.promptId.trim())
    ) {
      throw new LlmBridgeError(400, 'promptId must be a non-empty string when provided', {
        error: {
          message: 'promptId must be a non-empty string when provided',
          type: 'invalid_request_error',
        },
      });
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
    fileIds: string[] = [],
  ) {
    const payload: Record<string, unknown> = { ...body };
    delete payload.promptId;

    if (fileIds.length > 0) {
      payload.input = this.injectFileInputs(payload.input, fileIds);
    }

    // Backward compatibility:
    // Existing callers send Chat Completions-style { model, messages, ... }.
    // New upstream is /v1/responses, so translate messages -> input.
    if (Array.isArray(payload.messages) && payload.input == null) {
      payload.input = payload.messages;
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
    if (payload.prompt && typeof payload.prompt === 'object' && !Array.isArray(payload.prompt)) {
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
      if (typeof prompt.version === 'number') {
        prompt.version = String(prompt.version);
      }
    }

    return payload;
  }

  private resolvePromptId(requestPromptId?: string, defaultPromptId?: string) {
    return requestPromptId?.trim() || defaultPromptId;
  }

  private injectFileInputs(input: unknown, fileIds: string[]) {
    if (fileIds.length === 0) return input;

    const fileParts: Array<{ type: 'input_file'; file_id: string }> = fileIds.map((fileId) => ({
      type: 'input_file',
      file_id: fileId,
    }));

    if (typeof input === 'string') {
      const content: Array<{ type: 'input_text'; text: string } | { type: 'input_file'; file_id: string }> = [];
      if (input.trim()) content.push({ type: 'input_text', text: input });
      content.push(...fileParts);
      return [{ role: 'user', content }];
    }

    if (Array.isArray(input)) {
      return [...input, this.buildAttachmentMessage(fileParts)];
    }

    if (input && typeof input === 'object') {
      return [input, this.buildAttachmentMessage(fileParts)];
    }

    throw this.invalidRequest(
      400,
      'File attachments require request.input as a string, object, or array',
    );
  }

  private validateAttachmentCompatibility(
    body: LlmBridgeRequest,
    attachments: UploadedAttachment[],
  ) {
    if (attachments.length === 0) return;

    if (body.messages != null) {
      throw this.invalidRequest(400, 'File attachments are not supported with messages');
    }

    if (body.input == null) {
      throw this.invalidRequest(400, 'File attachments require request.input');
    }
  }

  private buildAttachmentMessage(fileParts: Array<{ type: 'input_file'; file_id: string }>) {
    const message: ResponseInputMessage = {
      role: 'user',
      content: fileParts,
    };

    return message;
  }

  private async uploadFileToOpenAI(
    attachment: UploadedAttachment,
    traceId: string,
    apiKey: string,
    filesUrl: string,
  ) {
    const form = new FormData();
    form.append('purpose', 'user_data');
    form.append(
      'file',
      new Blob([Uint8Array.from(attachment.buffer)], { type: attachment.mimeType }),
      attachment.filename,
    );

    const response = await this.fetchWithTimeout(
      filesUrl,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'x-trace-id': traceId,
        },
        body: form,
      },
      60_000,
    );

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new LlmBridgeError(502, 'OpenAI file upload failed', {
        error: {
          message: 'Failed to upload file to OpenAI Files API',
          type: 'server_error',
        },
        upstream_status: response.status,
        upstream_body: body,
      });
    }

    const json = (await response.json().catch(() => null)) as { id?: unknown } | null;
    if (!json || typeof json.id !== 'string' || !json.id.trim()) {
      throw new LlmBridgeError(502, 'OpenAI file upload failed', {
        error: {
          message: 'OpenAI Files API response did not include a file ID',
          type: 'server_error',
        },
      });
    }

    return json.id.trim();
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
      filesUrl: `${normalizedBase}/v1/files`,
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
