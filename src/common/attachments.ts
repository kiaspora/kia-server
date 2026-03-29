import type { Request } from 'express';
import Busboy from 'busboy';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { inferMimeFromFilename, parseBase64DataUrl } from './attachment.util';

export type RequestedAttachment = {
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

export type NormalizedAttachment = {
  filename: string;
  mimeType: string;
  fileData: string;
  size: number;
};

export type AttachmentErrorFactory<TError extends Error> = (
  statusCode: number,
  message: string,
) => TError;

export const DEFAULT_MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;
export const DEFAULT_MAX_ATTACHMENTS = 5;

type AttachmentValidationOptions<TError extends Error> = {
  attachments: unknown;
  createError: AttachmentErrorFactory<TError>;
  maxAttachments?: number;
};

type MultipartParseOptions<TBody, TError extends Error> = {
  req: Request;
  validateBody: (value: unknown) => TBody;
  createError: AttachmentErrorFactory<TError>;
  traceId?: string;
  logPrefix?: string;
  maxAttachments?: number;
  maxAttachmentBytes?: number;
};

type NormalizeAttachmentOptions<TError extends Error> = {
  requestedAttachments?: RequestedAttachment[];
  uploadedAttachments?: UploadedAttachment[];
  createError: AttachmentErrorFactory<TError>;
  traceId?: string;
  logPrefix?: string;
  allowedMimeTypes: Set<string>;
  maxAttachments?: number;
  maxAttachmentBytes?: number;
};

export function validateRequestedAttachments<TError extends Error>({
  attachments,
  createError,
  maxAttachments = DEFAULT_MAX_ATTACHMENTS,
}: AttachmentValidationOptions<TError>): RequestedAttachment[] {
  if (attachments == null) return [];
  if (!Array.isArray(attachments)) {
    throw createError(400, 'attachments must be an array when provided');
  }
  if (attachments.length > maxAttachments) {
    throw createError(
      400,
      `Too many attachments. Maximum ${maxAttachments} allowed`,
    );
  }

  return attachments.map((attachment) => {
    if (
      !attachment ||
      typeof attachment !== 'object' ||
      Array.isArray(attachment)
    ) {
      throw createError(400, 'each attachment must be an object');
    }

    const record = attachment as Record<string, unknown>;
    if (typeof record.name !== 'string' || !record.name.trim()) {
      throw createError(400, 'attachment.name must be a non-empty string');
    }

    if (
      record.file_data != null &&
      (typeof record.file_data !== 'string' || !record.file_data.trim())
    ) {
      throw createError(
        400,
        'attachment.file_data must be a non-empty string when provided',
      );
    }

    if (
      record.path != null &&
      (typeof record.path !== 'string' || !record.path.trim())
    ) {
      throw createError(
        400,
        'attachment.path must be a non-empty string when provided',
      );
    }

    if (record.file_data == null && record.path == null) {
      throw createError(
        400,
        `Attachment "${record.name}" must include either file_data or path`,
      );
    }

    return {
      name: record.name.trim(),
      ...(typeof record.file_data === 'string'
        ? { file_data: record.file_data.trim() }
        : {}),
      ...(typeof record.path === 'string' ? { path: record.path.trim() } : {}),
    };
  });
}

export async function parseMultipartWithAttachments<TBody, TError extends Error>({
  req,
  validateBody,
  createError,
  traceId = 'attachment-trace',
  logPrefix = '[attachments]',
  maxAttachments = DEFAULT_MAX_ATTACHMENTS,
  maxAttachmentBytes = DEFAULT_MAX_ATTACHMENT_BYTES,
}: MultipartParseOptions<TBody, TError>): Promise<{
  body: TBody;
  attachments: UploadedAttachment[];
}> {
  return await new Promise((resolve, reject) => {
    let settled = false;
    const rejectOnce = (error: TError) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    const bb = Busboy({
      headers: req.headers as Busboy.BusboyConfig['headers'],
      limits: {
        files: maxAttachments,
        fileSize: maxAttachmentBytes,
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
        if (total > maxAttachmentBytes) {
          rejectOnce(createError(413, 'Uploaded file is too large'));
          file.resume();
          return;
        }

        chunks.push(chunk);
      });

      file.on('limit', () =>
        rejectOnce(createError(413, 'Uploaded file is too large')),
      );
      file.on('end', () => {
        if (settled) return;
        if (total === 0) {
          rejectOnce(createError(400, `Uploaded file "${filename}" is empty`));
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
        rejectOnce(createError(400, 'Failed to read uploaded file')),
      );
    });

    bb.on('filesLimit', () =>
      rejectOnce(
        createError(400, `Too many files. Maximum ${maxAttachments} allowed`),
      ),
    );
    bb.on('error', () =>
      rejectOnce(createError(400, 'Invalid multipart/form-data payload')),
    );
    bb.on('finish', () => {
      if (settled) return;
      if (payloadField == null || !payloadField.trim()) {
        rejectOnce(createError(400, 'Missing payload field'));
        return;
      }

      let parsedPayload: unknown;
      try {
        parsedPayload = JSON.parse(payloadField);
      } catch {
        rejectOnce(createError(400, 'payload must be valid JSON'));
        return;
      }

      console.info(
        `${logPrefix} parsed multipart trace=${traceId} attachments=${attachments.length}`,
      );
      settled = true;
      resolve({
        body: validateBody(parsedPayload),
        attachments,
      });
    });

    const raw: unknown = (req as any).rawBody ?? (req as any).body;
    if (Buffer.isBuffer(raw)) bb.end(raw);
    else req.pipe(bb);
  });
}

export async function normalizeAttachments<TError extends Error>({
  requestedAttachments = [],
  uploadedAttachments = [],
  createError,
  traceId = 'attachment-trace',
  logPrefix = '[attachments]',
  allowedMimeTypes,
  maxAttachments = DEFAULT_MAX_ATTACHMENTS,
  maxAttachmentBytes = DEFAULT_MAX_ATTACHMENT_BYTES,
}: NormalizeAttachmentOptions<TError>): Promise<NormalizedAttachment[]> {
  const totalCount = requestedAttachments.length + uploadedAttachments.length;

  if (totalCount === 0) return [];
  if (totalCount > maxAttachments) {
    throw createError(400, `Too many attachments. Maximum ${maxAttachments} allowed`);
  }

  const normalized: NormalizedAttachment[] = [];

  for (const attachment of requestedAttachments) {
    if (attachment.file_data) {
      const parsed = parseAttachmentDataUrl(attachment.file_data, createError);
      validateNormalizedAttachment({
        filename: attachment.name,
        mimeType: parsed.mimeType,
        size: parsed.buffer.length,
        allowedMimeTypes,
        createError,
        maxAttachmentBytes,
      });
      logNormalizedAttachment({
        logPrefix,
        traceId,
        filename: attachment.name,
        mimeType: parsed.mimeType,
        size: parsed.buffer.length,
      });
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
        throw createError(
          400,
          `Attachment path could not be read: ${attachment.path}`,
        );
      }

      const filename = attachment.name || path.basename(attachment.path);
      const mimeType = inferMimeFromFilename(filename);
      if (!mimeType) {
        throw createError(
          400,
          `Could not infer MIME type for attachment: ${filename}`,
        );
      }

      validateNormalizedAttachment({
        filename,
        mimeType,
        size: fileBuffer.length,
        allowedMimeTypes,
        createError,
        maxAttachmentBytes,
      });
      logNormalizedAttachment({
        logPrefix,
        traceId,
        filename,
        mimeType,
        size: fileBuffer.length,
      });
      normalized.push({
        filename,
        mimeType,
        fileData: `data:${mimeType};base64,${fileBuffer.toString('base64')}`,
        size: fileBuffer.length,
      });
      continue;
    }

    throw createError(
      400,
      `Attachment "${attachment.name}" must include either file_data or path`,
    );
  }

  for (const attachment of uploadedAttachments) {
    validateNormalizedAttachment({
      filename: attachment.filename,
      mimeType: attachment.mimeType,
      size: attachment.size,
      allowedMimeTypes,
      createError,
      maxAttachmentBytes,
    });
    logNormalizedAttachment({
      logPrefix,
      traceId,
      filename: attachment.filename,
      mimeType: attachment.mimeType,
      size: attachment.size,
    });
    normalized.push({
      filename: attachment.filename,
      mimeType: attachment.mimeType,
      fileData: `data:${attachment.mimeType};base64,${attachment.buffer.toString('base64')}`,
      size: attachment.size,
    });
  }

  return normalized;
}

function parseAttachmentDataUrl<TError extends Error>(
  fileData: string,
  createError: AttachmentErrorFactory<TError>,
) {
  try {
    return parseBase64DataUrl(fileData);
  } catch (error) {
    throw createError(
      400,
      error instanceof Error ? error.message : 'attachments.file_data is invalid',
    );
  }
}

function validateNormalizedAttachment<TError extends Error>(args: {
  filename: string;
  mimeType: string;
  size: number;
  allowedMimeTypes: Set<string>;
  createError: AttachmentErrorFactory<TError>;
  maxAttachmentBytes: number;
}) {
  const {
    filename,
    mimeType,
    size,
    allowedMimeTypes,
    createError,
    maxAttachmentBytes,
  } = args;

  if (!size) {
    throw createError(400, `Attachment "${filename}" decoded to an empty file`);
  }

  if (size > maxAttachmentBytes) {
    throw createError(
      400,
      `Attachment "${filename}" exceeds max size of ${maxAttachmentBytes} bytes`,
    );
  }

  if (!allowedMimeTypes.has(mimeType)) {
    throw createError(400, `Unsupported attachment MIME type: ${mimeType}`);
  }
}

function logNormalizedAttachment(args: {
  logPrefix: string;
  traceId: string;
  filename: string;
  mimeType: string;
  size: number;
}) {
  const { logPrefix, traceId, filename, mimeType, size } = args;
  console.info(
    `${logPrefix} normalized attachment trace=${traceId} filename=${filename} mime=${mimeType} size=${size}`,
  );
}
