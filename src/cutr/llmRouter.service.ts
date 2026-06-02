import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import Busboy from 'busboy';
import { Readable } from 'node:stream';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';
import {
  normalizeAttachments,
  parseMultipartWithAttachments,
  validateRequestedAttachments,
} from '../common/attachments';

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
  attachments?: import('../common/attachments').RequestedAttachment[];
  traceId: string;
  model?: string;
  promptId?: string;
  promptVersion?: number;
  routing?: {
    priority: 'latency' | 'quality' | 'balanced' | null;
  };
  telemetry?: {
    request_id: string | null;
  };
};

type CustomPromptRequest = {
  promptId: string;
  promptVersion: number;
  stream: boolean;
  input: unknown;
  traceId: string;
  model?: string;
};

type CustomPromptResult =
  | {
      kind: 'json';
      body: unknown;
    }
  | {
      kind: 'stream';
      body: Readable;
      contentType: string | null;
    };

type UniversalUsage = {
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  reasoning_tokens: number | null;
  cached_input_tokens: number | null;
  cache_hit_tokens: number | null;
  cache_miss_tokens: number | null;
};

type UniversalPerformance = {
  queue_time_ms: number | null;
  prompt_time_ms: number | null;
  completion_time_ms: number | null;
  total_time_ms: number | null;
};

type UniversalRouting = {
  selected_provider: string | null;
  fallback_used: boolean;
  fallback_from: string | null;
  priority: 'latency' | 'quality' | 'balanced' | null;
};

type UniversalTelemetry = {
  request_id: string | null;
  response_id: string | null;
  timestamp: string | null;
};

type ProviderResult = {
  content: unknown;
  archetype: string | null;
  provider: Provider;
  model: string | null;
  latency_ms: number | null;
  usage: UniversalUsage;
  performance: UniversalPerformance;
  routing: UniversalRouting;
  telemetry: UniversalTelemetry;
  raw_provider_meta: {
    id: string | null;
    usage: Record<string, unknown>;
    raw: Record<string, unknown>;
  };
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

function extractTextFromProviderBody(body: any): string {
  const outputText = body?.output_text;
  if (typeof outputText === 'string' && outputText.trim()) {
    return outputText.trim();
  }

  const output = body?.output;
  if (Array.isArray(output)) {
    const parts: string[] = [];
    for (const item of output) {
      const content = item?.content;
      if (!Array.isArray(content)) continue;

      for (const block of content) {
        if (typeof block?.text === 'string') {
          parts.push(block.text);
          continue;
        }

        if (typeof block?.text?.value === 'string') {
          parts.push(block.text.value);
          continue;
        }

        if (typeof block?.content === 'string') {
          parts.push(block.content);
          continue;
        }

        if (typeof block?.content?.value === 'string') {
          parts.push(block.content.value);
        }
      }
    }

    const joined = parts.join('').trim();
    if (joined) return joined;
  }

  const chatCompletion = body?.choices?.[0]?.message?.content;
  if (typeof chatCompletion === 'string' && chatCompletion.trim()) {
    return chatCompletion.trim();
  }

  return '';
}

function toNullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return null;
}

function toMilliseconds(value: unknown): number | null {
  const seconds = toNullableNumber(value);
  return seconds == null ? null : seconds * 1000;
}

function normalizeContent(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return value;

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
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
const VALID_PRIORITIES = ['latency', 'quality', 'balanced'] as const;
type RoutingPriority = (typeof VALID_PRIORITIES)[number];
const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;
const MAX_ATTACHMENTS = 5;
const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  'application/json',
  'text/markdown',
  'text/plain',
  'application/xml',
  'text/xml',
  'application/pdf',
]);

@Injectable()
export class LlmRouterService {
  async parseMultipart(
    req: Request,
    traceId = 'cutr-llmRouter-trace',
  ): Promise<{
    body: Omit<LlmRouterRequest, 'traceId'>;
    attachments: import('../common/attachments').UploadedAttachment[];
  }> {
    return await parseMultipartWithAttachments({
      req,
      traceId,
      logPrefix: '[cutr.llmRouter]',
      maxAttachments: MAX_ATTACHMENTS,
      maxAttachmentBytes: MAX_ATTACHMENT_BYTES,
      validateBody: (value) => this.validate(value),
      createError: (statusCode, message) =>
        new HttpError(statusCode, message, 'INVALID_ATTACHMENT_REQUEST'),
    });
  }

  async parseCustomPromptMultipart(
    req: Request,
    traceId = 'cutr-customPrompt-trace',
  ): Promise<{
    body: Omit<CustomPromptRequest, 'traceId'>;
    attachments: import('../common/attachments').UploadedAttachment[];
  }> {
    return await new Promise((resolve, reject) => {
      let settled = false;
      const rejectOnce = (error: HttpError) => {
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

      const attachments: import('../common/attachments').UploadedAttachment[] =
        [];
      const fields: Record<string, string> = {};

      bb.on('field', (name, value) => {
        if (name === 'traceId' && fields.traceId === undefined) {
          fields.traceId = value;
        } else if (fields[name] === undefined) {
          fields[name] = value;
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
            rejectOnce(
              new HttpError(
                413,
                'Uploaded file is too large',
                'FILE_TOO_LARGE',
              ),
            );
            file.resume();
            return;
          }

          chunks.push(chunk);
        });

        file.on('limit', () =>
          rejectOnce(
            new HttpError(413, 'Uploaded file is too large', 'FILE_TOO_LARGE'),
          ),
        );
        file.on('end', () => {
          if (settled) return;
          if (total === 0) {
            rejectOnce(
              new HttpError(
                400,
                `Uploaded file "${filename}" is empty`,
                'EMPTY_FILE',
              ),
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
          rejectOnce(
            new HttpError(
              400,
              'Failed to read uploaded file',
              'FILE_READ_ERROR',
            ),
          ),
        );
      });

      bb.on('filesLimit', () =>
        rejectOnce(
          new HttpError(
            400,
            `Too many files. Maximum ${MAX_ATTACHMENTS} allowed`,
            'TOO_MANY_FILES',
          ),
        ),
      );
      bb.on('error', () =>
        rejectOnce(
          new HttpError(
            400,
            'Invalid multipart/form-data payload',
            'INVALID_MULTIPART',
          ),
        ),
      );
      bb.on('finish', () => {
        if (settled) return;

        const promptId = fields.promptId;
        const promptVersion = fields.promptVersion;
        const stream = fields.stream;
        const payload = fields.payload;
        const traceIdField = fields.traceId;

        if (!promptId || !promptId.trim()) {
          rejectOnce(
            new HttpError(
              400,
              'Missing required field: promptId',
              'MISSING_PROMPT_ID',
            ),
          );
          return;
        }

        if (!promptVersion || !promptVersion.trim()) {
          rejectOnce(
            new HttpError(
              400,
              'Missing required field: promptVersion',
              'MISSING_PROMPT_VERSION',
            ),
          );
          return;
        }

        if (!payload || !payload.trim()) {
          rejectOnce(
            new HttpError(
              400,
              'Missing required field: payload',
              'MISSING_PAYLOAD',
            ),
          );
          return;
        }

        let parsedPayload: unknown;
        try {
          parsedPayload = JSON.parse(payload);
        } catch {
          rejectOnce(
            new HttpError(
              400,
              'payload must be valid JSON',
              'INVALID_PAYLOAD_JSON',
            ),
          );
          return;
        }

        const promptVersionNum = Number.parseInt(promptVersion, 10);
        if (!Number.isInteger(promptVersionNum) || promptVersionNum < 1) {
          rejectOnce(
            new HttpError(
              400,
              'promptVersion must be a positive integer',
              'INVALID_PROMPT_VERSION',
            ),
          );
          return;
        }

        const streamBool =
          stream === 'true' || stream === '1'
            ? true
            : stream === 'false' || stream === '0'
              ? false
              : false;

        const body = {
          promptId: promptId.trim(),
          promptVersion: promptVersionNum,
          stream: streamBool,
          input: parsedPayload,
          ...(fields.model ? { model: fields.model.trim() } : {}),
        };

        console.info(
          `[cutr.customPrompt] parsed multipart trace=${traceId} attachments=${attachments.length}`,
        );
        settled = true;
        resolve({
          body: this.validateCustomPrompt(body),
          attachments,
        });
      });

      const raw: unknown = (req as any).rawBody ?? (req as any).body;
      if (Buffer.isBuffer(raw)) bb.end(raw);
      else req.pipe(bb);
    });
  }

  async handle(
    body: any,
    traceId: string,
    uploadedAttachments: import('../common/attachments').UploadedAttachment[] = [],
  ): Promise<ProviderResult> {
    const validated = this.validate(body);
    const attachments = await this.normalizeAttachments(
      validated.attachments,
      uploadedAttachments,
      traceId,
    );

    const payload: LlmRouterRequest = {
      ...validated,
      traceId,
    };

    if (attachments.length > 0 && validated.provider !== 'openai') {
      throw new HttpError(
        400,
        'Attachments are currently supported only for provider "openai"',
        'ATTACHMENTS_UNSUPPORTED_FOR_PROVIDER',
      );
    }

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
        return await this.callOpenAI(payload, attachments);
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

  async handleCustomPrompt(
    body: any,
    traceId: string,
    uploadedAttachments: import('../common/attachments').UploadedAttachment[] = [],
  ): Promise<CustomPromptResult> {
    const validated = this.validateCustomPrompt(body);
    const attachments = await this.normalizeAttachments(
      [],
      uploadedAttachments,
      traceId,
    );

    const payload: CustomPromptRequest = {
      ...validated,
      traceId,
    };

    try {
      return await this.callOpenAICustomPrompt(payload, attachments);
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      throw new HttpError(
        502,
        'OpenAI is currently unavailable; please try again later',
        'OPENAI_UNAVAILABLE',
        { message: String(err?.message ?? err) },
      );
    }
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

    const attachments = validateRequestedAttachments({
      attachments: body.attachments,
      maxAttachments: MAX_ATTACHMENTS,
      createError: (statusCode, message) =>
        new HttpError(statusCode, message, 'INVALID_ATTACHMENT_REQUEST'),
    });

    const promptId = body.promptId;
    const promptVersion = body.promptVersion;
    const model = isNonEmptyString(body.model) ? body.model.trim() : undefined;

    let routing: LlmRouterRequest['routing'];
    const routingRaw = body.routing;
    if (
      routingRaw &&
      typeof routingRaw === 'object' &&
      !Array.isArray(routingRaw)
    ) {
      const priorityRaw = (routingRaw as Record<string, unknown>).priority;
      if (priorityRaw == null || priorityRaw === '') {
        routing = { priority: null };
      } else if (
        typeof priorityRaw === 'string' &&
        VALID_PRIORITIES.includes(priorityRaw.trim() as RoutingPriority)
      ) {
        routing = { priority: priorityRaw.trim() as RoutingPriority };
      } else {
        throw new HttpError(
          400,
          'routing.priority must be "latency", "quality", or "balanced"',
          'INVALID_ROUTING_PRIORITY',
        );
      }
    }

    let telemetry: LlmRouterRequest['telemetry'];
    const telemetryRaw = body.telemetry;
    if (
      telemetryRaw &&
      typeof telemetryRaw === 'object' &&
      !Array.isArray(telemetryRaw)
    ) {
      const requestIdRaw = (telemetryRaw as Record<string, unknown>).request_id;
      if (requestIdRaw == null || requestIdRaw === '') {
        telemetry = { request_id: null };
      } else if (typeof requestIdRaw === 'string') {
        telemetry = { request_id: requestIdRaw.trim() || null };
      } else {
        throw new HttpError(
          400,
          'telemetry.request_id must be a string when provided',
          'INVALID_TELEMETRY_REQUEST_ID',
        );
      }
    }

    return {
      provider,
      stream,
      archetype,
      messages,
      ...(attachments.length > 0 ? { attachments } : {}),
      ...(model ? { model } : {}),
      ...(typeof promptId === 'string' ? { promptId } : {}),
      ...(typeof promptVersion === 'number' ? { promptVersion } : {}),
      ...(routing ? { routing } : {}),
      ...(telemetry ? { telemetry } : {}),
    };
  }

  private validateCustomPrompt(
    body: any,
  ): Omit<CustomPromptRequest, 'traceId'> {
    if (!body || typeof body !== 'object') {
      throw new HttpError(400, 'Request body is required', 'MISSING_BODY');
    }

    const promptId = body.promptId;
    if (!isNonEmptyString(promptId)) {
      throw new HttpError(
        400,
        'Missing required field: promptId',
        'MISSING_PROMPT_ID',
      );
    }

    const promptVersionRaw = body.promptVersion;
    if (!Number.isInteger(promptVersionRaw) || Number(promptVersionRaw) < 1) {
      throw new HttpError(
        400,
        'promptVersion must be a positive integer',
        'INVALID_PROMPT_VERSION',
      );
    }
    const promptVersion = Number(promptVersionRaw);

    const stream = typeof body.stream === 'boolean' ? body.stream : false;

    const input = body.input;
    if (input === undefined || input === null) {
      throw new HttpError(
        400,
        'Missing required field: input',
        'MISSING_INPUT',
      );
    }

    const model = isNonEmptyString(body.model) ? body.model.trim() : undefined;

    return {
      promptId: promptId.trim(),
      promptVersion,
      stream,
      input,
      ...(model ? { model } : {}),
    };
  }

  private buildNormalizedResult(args: {
    payload: LlmRouterRequest;
    provider: Provider;
    model: string;
    latency_ms: number;
    parsed: any;
    usage: UniversalUsage;
    performance?: Partial<UniversalPerformance>;
    requestId?: string | null;
    timestamp?: string | null;
  }): ProviderResult {
    const {
      payload,
      provider,
      model,
      latency_ms,
      parsed,
      usage,
      performance,
      requestId,
      timestamp,
    } = args;

    return {
      content: normalizeContent(extractTextFromProviderBody(parsed)),
      archetype: payload.archetype ?? null,
      provider,
      model,
      latency_ms,
      usage,
      performance: {
        queue_time_ms: null,
        prompt_time_ms: null,
        completion_time_ms: null,
        total_time_ms: null,
        ...performance,
      },
      routing: {
        selected_provider: provider,
        fallback_used: false,
        fallback_from: null,
        priority: payload.routing?.priority ?? null,
      },
      telemetry: {
        request_id: payload.telemetry?.request_id ?? requestId ?? null,
        response_id: typeof parsed?.id === 'string' ? parsed.id : null,
        timestamp:
          (typeof parsed?.created_at === 'string' && parsed.created_at) ||
          (typeof parsed?.timestamp === 'string' && parsed.timestamp) ||
          timestamp ||
          new Date().toISOString(),
      },
      raw_provider_meta: {
        id: typeof parsed?.id === 'string' ? parsed.id : null,
        usage:
          parsed?.usage &&
          typeof parsed.usage === 'object' &&
          !Array.isArray(parsed.usage)
            ? (parsed.usage as Record<string, unknown>)
            : {},
        raw:
          parsed && typeof parsed === 'object' && !Array.isArray(parsed)
            ? (parsed as Record<string, unknown>)
            : {},
      },
    };
  }

  private async callOpenAI(
    payload: LlmRouterRequest,
    attachments: import('../common/attachments').NormalizedAttachment[],
  ): Promise<ProviderResult> {
    const apiKey = pickFirstEnv('OPENAI_ARCHETYPE_API_KEY', 'OPENAI_API_KEY');
    if (!apiKey) {
      throw new HttpError(
        500,
        'Missing OPENAI_ARCHETYPE_API_KEY',
        'MISSING_OPENAI_API_KEY',
      );
    }

    const model =
      payload.model ||
      pickFirstEnv('OPENAI_PROMPT_MODEL', 'OPENAI_MODEL') ||
      'gpt-4.1-mini';
    const requestBody: Record<string, unknown> = {
      model,
      input:
        attachments.length > 0
          ? this.buildOpenAIInput(payload.messages, attachments)
          : payload.messages,
      stream: payload.stream,
    };

    if (!/^gpt-5/i.test(model)) {
      requestBody.temperature = 0.7;
    }

    const maxOutputTokens = process.env.OPENAI_MAX_OUTPUT_TOKENS;
    if (isNonEmptyString(maxOutputTokens)) {
      const parsed = Number.parseInt(maxOutputTokens, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        requestBody.max_output_tokens = parsed;
      }
    }

    const started = Date.now();

    const resp = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
        'x-trace-id': payload.traceId,
      },
      body: JSON.stringify(requestBody),
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

    const usage = parsed?.usage ?? {};
    return this.buildNormalizedResult({
      payload,
      provider: 'openai',
      model,
      latency_ms,
      parsed,
      requestId: resp.headers.get('x-request-id'),
      usage: {
        input_tokens: toNullableNumber(usage?.input_tokens),
        output_tokens: toNullableNumber(usage?.output_tokens),
        total_tokens: toNullableNumber(usage?.total_tokens),
        reasoning_tokens: toNullableNumber(
          usage?.output_tokens_details?.reasoning_tokens,
        ),
        cached_input_tokens: toNullableNumber(
          usage?.input_tokens_details?.cached_tokens,
        ),
        cache_hit_tokens: null,
        cache_miss_tokens: null,
      },
    });
  }

  private async callOpenAICustomPrompt(
    payload: CustomPromptRequest,
    attachments: import('../common/attachments').NormalizedAttachment[],
  ): Promise<CustomPromptResult> {
    const apiKey = pickFirstEnv('OPENAI_ARCHETYPE_API_KEY', 'OPENAI_API_KEY');
    if (!apiKey) {
      throw new HttpError(
        500,
        'Missing OPENAI_ARCHETYPE_API_KEY',
        'MISSING_OPENAI_API_KEY',
      );
    }

    const model =
      payload.model ||
      pickFirstEnv('OPENAI_PROMPT_MODEL', 'OPENAI_MODEL') ||
      'gpt-4.1-mini';
    const requestBody: Record<string, unknown> = {
      model,
      prompt: {
        id: payload.promptId,
        version: String(payload.promptVersion),
      },
      input: this.buildOpenAICustomPromptInput(payload.input, attachments),
      stream: payload.stream,
    };

    if (!/^gpt-5/i.test(model)) {
      requestBody.temperature = 0.7;
    }

    const maxOutputTokens = process.env.OPENAI_MAX_OUTPUT_TOKENS;
    if (isNonEmptyString(maxOutputTokens)) {
      const parsed = Number.parseInt(maxOutputTokens, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        requestBody.max_output_tokens = parsed;
      }
    }

    const started = Date.now();

    const resp = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
        'x-trace-id': payload.traceId,
      },
      body: JSON.stringify(requestBody),
    });

    if (!resp.ok) {
      const rawText = await resp.text().catch(() => '');
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

    if (payload.stream) {
      if (!resp.body) {
        throw new HttpError(
          502,
          'OpenAI returned an empty streaming response body',
          'OPENAI_EMPTY_STREAM',
        );
      }

      return {
        kind: 'stream',
        body: Readable.fromWeb(resp.body as unknown as NodeReadableStream),
        contentType: resp.headers.get('content-type'),
      };
    }

    const rawText = await resp.text().catch(() => '');

    try {
      return {
        kind: 'json',
        body: rawText ? JSON.parse(rawText) : {},
      };
    } catch {
      throw new HttpError(
        502,
        'OpenAI returned invalid JSON',
        'OPENAI_INVALID_JSON',
        {
          bodySnippet: rawText.slice(0, 800),
        },
      );
    }
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

    const model =
      payload.model || pickFirstEnv('DEEPSEEK_MODEL') || 'deepseek-chat';
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

    const usage = parsed?.usage ?? {};
    return this.buildNormalizedResult({
      payload,
      provider: 'deepseek',
      model,
      latency_ms,
      parsed,
      requestId: resp.headers.get('x-request-id'),
      usage: {
        input_tokens: toNullableNumber(usage?.prompt_tokens),
        output_tokens: toNullableNumber(usage?.completion_tokens),
        total_tokens: toNullableNumber(usage?.total_tokens),
        reasoning_tokens: null,
        cached_input_tokens: toNullableNumber(
          usage?.prompt_tokens_details?.cached_tokens,
        ),
        cache_hit_tokens: toNullableNumber(usage?.prompt_cache_hit_tokens),
        cache_miss_tokens: toNullableNumber(usage?.prompt_cache_miss_tokens),
      },
    });
  }

  private async callGroq(payload: LlmRouterRequest): Promise<ProviderResult> {
    const apiKey = pickFirstEnv('GROQ_API_KEY', 'GROQ_KIA_API_KEY');
    if (!apiKey)
      throw new HttpError(500, 'Missing GROQ_API_KEY', 'MISSING_GROQ_API_KEY');

    const model =
      payload.model || pickFirstEnv('GROQ_MODEL') || 'llama-3.1-8b-instant';
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

    const usage = parsed?.usage ?? {};
    return this.buildNormalizedResult({
      payload,
      provider: 'groq',
      model,
      latency_ms,
      parsed,
      requestId: resp.headers.get('x-request-id'),
      usage: {
        input_tokens: toNullableNumber(usage?.prompt_tokens),
        output_tokens: toNullableNumber(usage?.completion_tokens),
        total_tokens: toNullableNumber(usage?.total_tokens),
        reasoning_tokens: null,
        cached_input_tokens: null,
        cache_hit_tokens: null,
        cache_miss_tokens: null,
      },
      performance: {
        queue_time_ms: toMilliseconds(usage?.queue_time),
        prompt_time_ms: toMilliseconds(usage?.prompt_time),
        completion_time_ms: toMilliseconds(usage?.completion_time),
        total_time_ms: toMilliseconds(usage?.total_time),
      },
    });
  }

  private async normalizeAttachments(
    attachments:
      | import('../common/attachments').RequestedAttachment[]
      | undefined,
    uploadedAttachments: import('../common/attachments').UploadedAttachment[],
    traceId: string,
  ): Promise<import('../common/attachments').NormalizedAttachment[]> {
    return await normalizeAttachments({
      requestedAttachments: attachments,
      uploadedAttachments,
      traceId,
      logPrefix: '[cutr.llmRouter]',
      allowedMimeTypes: ALLOWED_ATTACHMENT_MIME_TYPES,
      maxAttachments: MAX_ATTACHMENTS,
      maxAttachmentBytes: MAX_ATTACHMENT_BYTES,
      createError: (statusCode, message) =>
        new HttpError(statusCode, message, 'INVALID_ATTACHMENT_REQUEST'),
    });
  }

  private buildOpenAIInput(
    messages: Message[],
    attachments: import('../common/attachments').NormalizedAttachment[],
  ) {
    const hasUserMessage = messages.some((message) => message.role === 'user');
    const input = messages.map((message) => ({
      role: message.role,
      content:
        message.role === 'user'
          ? [
              { type: 'input_text' as const, text: message.content },
              ...this.buildOpenAIFileContentItems(attachments),
            ]
          : [{ type: 'input_text' as const, text: message.content }],
    }));

    if (!hasUserMessage && attachments.length > 0) {
      input.push({
        role: 'user',
        content: this.buildOpenAIFileContentItems(attachments),
      });
    }

    return input;
  }

  private buildOpenAICustomPromptInput(
    input: unknown,
    attachments: import('../common/attachments').NormalizedAttachment[],
  ) {
    if (Array.isArray(input)) {
      return input.map((item) => {
        if (
          item &&
          typeof item === 'object' &&
          'role' in item &&
          item.role === 'user'
        ) {
          const content = item.content;
          if (Array.isArray(content)) {
            return {
              ...item,
              content: [
                ...content,
                ...this.buildOpenAIFileContentItems(attachments),
              ],
            };
          } else if (typeof content === 'string') {
            return {
              ...item,
              content: [
                { type: 'input_text' as const, text: content },
                ...this.buildOpenAIFileContentItems(attachments),
              ],
            };
          }
        }
        return item;
      });
    }

    if (typeof input === 'string') {
      return [
        {
          role: 'user' as const,
          content: [
            { type: 'input_text' as const, text: input },
            ...this.buildOpenAIFileContentItems(attachments),
          ],
        },
      ];
    }

    if (input && typeof input === 'object' && !Array.isArray(input)) {
      return [
        {
          role: 'user' as const,
          content: [
            { type: 'input_text' as const, text: JSON.stringify(input) },
            ...this.buildOpenAIFileContentItems(attachments),
          ],
        },
      ];
    }

    return input;
  }

  private buildOpenAIFileContentItems(
    attachments: import('../common/attachments').NormalizedAttachment[],
  ) {
    return attachments.map((attachment) => ({
      type: 'input_file' as const,
      filename: attachment.filename,
      file_data: attachment.fileData,
    }));
  }
}
