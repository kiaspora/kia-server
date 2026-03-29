import * as path from 'node:path';

export interface ParsedDataUrl {
  mimeType: string;
  base64: string;
  buffer: Buffer;
}

const DATA_URL_RE = /^data:([\w.+-]+\/[\w.+-]+);base64,([A-Za-z0-9+/=]+)$/;

export function parseBase64DataUrl(value: string): ParsedDataUrl {
  const match = value.match(DATA_URL_RE);
  if (!match) {
    throw new Error(
      'attachments.file_data must be a valid data URL like data:text/plain;base64,SGVsbG8=',
    );
  }

  const [, mimeType, base64] = match;
  const buffer = Buffer.from(base64, 'base64');
  const normalizedInput = base64.replace(/=+$/u, '');
  const normalizedDecoded = buffer.toString('base64').replace(/=+$/u, '');

  if (!buffer.length || normalizedInput !== normalizedDecoded) {
    throw new Error('attachments.file_data contains invalid base64');
  }

  return { mimeType, base64, buffer };
}

export function inferMimeFromFilename(filename: string): string | null {
  const ext = path.extname(filename).toLowerCase();

  switch (ext) {
    case '.txt':
      return 'text/plain';
    case '.md':
      return 'text/markdown';
    case '.json':
      return 'application/json';
    case '.xml':
      return 'application/xml';
    case '.pdf':
      return 'application/pdf';
    default:
      return null;
  }
}
