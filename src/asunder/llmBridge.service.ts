import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import Busboy from 'busboy';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { inferMimeFromFilename, parseBase64DataUrl } from './attachment.util';

type ChatMessageRole = 'system' | 'developer' | 'user' | 'assistant' | 'tool';
type ChatMessage = {
  role: ChatMessageRole;
  [key: string]: unknown;
};

type PromptRef = {
  id?: string;
  version?: string;
};

type RequestedAttachment = {
  name: string;
  file_data?: string;
  path?: string;
};

export type UploadedAttachment = {
  filename: string;
  mimeType: string;
  buffer: Buffer;
  size: number;
};

type NormalizedAttachment = {
  filename: string;
  mimeType: string;
  fileData: string;
  size: number;
};

const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;
const MAX_ATTACHMENTS = 5;
const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  'text/plain',
  'text/markdown',
  'application/json',
  'text/csv',
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
    return await new Promise((resolve, reject) => {
      let settled = false;
      const rejectOnce = (error: LlmBridgeError) => {
        if (settled) return;
        settled = true;
        reject(error);
      };

      const bb = Busboy({
        headers: req.headers as Busboy.BusboyConfig['headers'],
        limits: {
          files: MAX_ATTACHMENTS,
          fileSize: MAX_ATTACHMENT_BYTES,
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
          if (total > MAX_ATTACHMENT_BYTES) {
            rejectOnce(this.invalidRequest(413, 'Uploaded file is too large'));
            file.resume();
            return;
          }

          chunks.push(chunk);
        });

        file.on('limit', () =>
          rejectOnce(this.invalidRequest(413, 'Uploaded file is too large')),
        );
        file.on('end', () => {
          if (settled) return;
          if (total === 0) {
            rejectOnce(
              this.invalidRequest(400, `Uploaded file "${filename}" is empty`),
            );
            return;
          }

          attachments.push({
            filename,
            mimeType,
            buffer: Buffer.concat(chunks),
            size: total,
          });
        });
        file.on('error', () =>
          rejectOnce(this.invalidRequest(400, 'Failed to read uploaded file')),
        );
      });

      bb.on('filesLimit', () =>
        rejectOnce(
          this.invalidRequest(
            400,
            `Too many files. Maximum ${MAX_ATTACHMENTS} allowed`,
          ),
        ),
      );
      bb.on('error', () =>
        rejectOnce(
          this.invalidRequest(400, 'Invalid multipart/form-data payload'),
        ),
      );
      bb.on('finish', () => {
        if (settled) return;
        if (payloadField == null || !payloadField.trim()) {
          rejectOnce(this.invalidRequest(400, 'Missing payload field'));
          return;
        }

        let parsedPayload: unknown;
        try {
          parsedPayload = JSON.parse(payloadField);
        } catch {
          rejectOnce(this.invalidRequest(400, 'payload must be valid JSON'));
          return;
        }

        console.info(
          `[asunder.llmBridge] parsed multipart trace=${traceId} attachments=${attachments.length}`,
        );
        settled = true;
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
      throw new LlmBridgeError(
        400,
        'attachments must be an array when provided',
        {
          error: {
            message: 'attachments must be an array when provided',
            type: 'invalid_request_error',
          },
        },
      );
    }

    const attachments = (body.attachments as unknown[] | undefined) ?? [];
    if (attachments.length > MAX_ATTACHMENTS) {
      throw new LlmBridgeError(
        400,
        `Too many attachments. Maximum ${MAX_ATTACHMENTS} allowed`,
        {
          error: {
            message: `Too many attachments. Maximum ${MAX_ATTACHMENTS} allowed`,
            type: 'invalid_request_error',
          },
        },
      );
    }

    for (const attachment of attachments) {
      if (
        !attachment ||
        typeof attachment !== 'object' ||
        Array.isArray(attachment)
      ) {
        throw new LlmBridgeError(400, 'each attachment must be an object', {
          error: {
            message: 'each attachment must be an object',
            type: 'invalid_request_error',
          },
        });
      }

      const record = attachment as Record<string, unknown>;
      if (typeof record.name !== 'string' || !record.name.trim()) {
        throw new LlmBridgeError(
          400,
          'attachment.name must be a non-empty string',
          {
            error: {
              message: 'attachment.name must be a non-empty string',
              type: 'invalid_request_error',
            },
          },
        );
      }

      if (
        record.file_data != null &&
        (typeof record.file_data !== 'string' || !record.file_data.trim())
      ) {
        throw new LlmBridgeError(
          400,
          'attachment.file_data must be a non-empty string when provided',
          {
            error: {
              message:
                'attachment.file_data must be a non-empty string when provided',
              type: 'invalid_request_error',
            },
          },
        );
      }

      if (
        record.path != null &&
        (typeof record.path !== 'string' || !record.path.trim())
      ) {
        throw new LlmBridgeError(
          400,
          'attachment.path must be a non-empty string when provided',
          {
            error: {
              message:
                'attachment.path must be a non-empty string when provided',
              type: 'invalid_request_error',
            },
          },
        );
      }

      if (record.file_data == null && record.path == null) {
        throw new LlmBridgeError(
          400,
          `Attachment "${record.name}" must include either file_data or path`,
          {
            error: {
              message: `Attachment "${record.name}" must include either file_data or path`,
              type: 'invalid_request_error',
            },
          },
        );
      }
    }

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
    const requestedAttachments = attachments ?? [];
    const totalCount = requestedAttachments.length + uploadedAttachments.length;

    if (totalCount === 0) return [];
    if (totalCount > MAX_ATTACHMENTS) {
      throw this.invalidRequest(
        400,
        `Too many attachments. Maximum ${MAX_ATTACHMENTS} allowed`,
      );
    }

    const normalized: NormalizedAttachment[] = [];

    for (const attachment of requestedAttachments) {
      if (attachment.file_data) {
        const parsed = this.parseAttachmentDataUrl(attachment.file_data);
        this.validateNormalizedAttachment(
          attachment.name,
          parsed.mimeType,
          parsed.buffer.length,
        );
        this.logNormalizedAttachment(
          traceId,
          attachment.name,
          parsed.mimeType,
          parsed.buffer.length,
        );
        normalized.push({
          filename: attachment.name,
          mimeType: parsed.mimeType,
          fileData: attachment.file_data,
          size: parsed.buffer.length,
        });
        continue;
      }

      if (attachment.path) {
        let fileBuffer: Buffer;
        try {
          fileBuffer = await fs.readFile(attachment.path);
        } catch {
          throw this.invalidRequest(
            400,
            `Attachment path could not be read: ${attachment.path}`,
          );
        }
        const filename = attachment.name || path.basename(attachment.path);
        const mimeType = inferMimeFromFilename(filename);

        if (!mimeType) {
          throw this.invalidRequest(
            400,
            `Could not infer MIME type for attachment: ${filename}`,
          );
        }

        this.validateNormalizedAttachment(
          filename,
          mimeType,
          fileBuffer.length,
        );
        this.logNormalizedAttachment(
          traceId,
          filename,
          mimeType,
          fileBuffer.length,
        );
        normalized.push({
          filename,
          mimeType,
          fileData: `data:${mimeType};base64,${fileBuffer.toString('base64')}`,
          size: fileBuffer.length,
        });
        continue;
      }

      throw this.invalidRequest(
        400,
        `Attachment "${attachment.name}" must include either file_data or path`,
      );
    }

    for (const attachment of uploadedAttachments) {
      this.validateNormalizedAttachment(
        attachment.filename,
        attachment.mimeType,
        attachment.size,
      );
      this.logNormalizedAttachment(
        traceId,
        attachment.filename,
        attachment.mimeType,
        attachment.size,
      );
      normalized.push({
        filename: attachment.filename,
        mimeType: attachment.mimeType,
        fileData: `data:${attachment.mimeType};base64,${attachment.buffer.toString('base64')}`,
        size: attachment.size,
      });
    }

    return normalized;
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

  private parseAttachmentDataUrl(fileData: string) {
    try {
      return parseBase64DataUrl(fileData);
    } catch (error) {
      throw this.invalidRequest(
        400,
        error instanceof Error
          ? error.message
          : 'attachments.file_data is invalid',
      );
    }
  }

  private validateNormalizedAttachment(
    filename: string,
    mimeType: string,
    size: number,
  ) {
    if (!size) {
      throw this.invalidRequest(
        400,
        `Attachment "${filename}" decoded to an empty file`,
      );
    }

    if (size > MAX_ATTACHMENT_BYTES) {
      throw this.invalidRequest(
        400,
        `Attachment "${filename}" exceeds max size of ${MAX_ATTACHMENT_BYTES} bytes`,
      );
    }

    if (!ALLOWED_ATTACHMENT_MIME_TYPES.has(mimeType)) {
      throw this.invalidRequest(
        400,
        `Unsupported attachment MIME type: ${mimeType}`,
      );
    }
  }

  private logNormalizedAttachment(
    traceId: string,
    filename: string,
    mimeType: string,
    size: number,
  ) {
    console.info(
      `[asunder.llmBridge] normalized attachment trace=${traceId} filename=${filename} mime=${mimeType} size=${size}`,
    );
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
