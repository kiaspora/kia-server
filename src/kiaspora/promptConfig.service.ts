import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { Pool } from 'pg';

class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

function isNonEmptyString(x: any): x is string {
  return typeof x === 'string' && x.trim().length > 0;
}

function requireEnv(name: string): string {
  const v = (process.env[name] ?? '').trim().replace(/^["']|["']$/g, '');
  if (!v) throw new HttpError(500, `Server misconfigured: missing ${name}`);
  return v;
}

function parsePromptName(promptNameRaw: any, allowDefault = true) {
  const promptName = (promptNameRaw || (allowDefault ? 'global' : '')).toString().trim().toLowerCase();
  if (!promptName) throw new HttpError(400, '"prompt_name" is required');
  return promptName;
}

function parseIncludeGlobal(req: Request) {
  const raw = (req.query.includeGlobal ?? '0').toString().trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}

function parsePromptId(req: Request, body: any) {
  const q: any = req.query || {};
  const pid = (q.prompt_id || q.promptId || body?.prompt_id || body?.promptId || '').toString().trim();
  if (!pid) throw new HttpError(400, '"prompt_id" is required');
  return pid;
}

function pick(body: any, ...keys: string[]) {
  for (const k of keys) {
    const v = body?.[k];
    if (v !== undefined) return v;
  }
  return undefined;
}

/* -------------------------------------------------------------------------- */
/* neon pool (lazy singleton)                                                 */
/* -------------------------------------------------------------------------- */

let pool: Pool | null = null;

function getPool(): Pool {
  if (pool) return pool;

  const NEON_USER = requireEnv('NEON_USER');
  const NEON_PASSWORD = requireEnv('NEON_PASSWORD');
  const NEON_DB = requireEnv('NEON_DB');
  const NEON_HOST = requireEnv('NEON_HOST');

  const QUERY_FLAGS = "sslmode=verify-full";

  const connectionString = `postgresql://${NEON_USER}:${encodeURIComponent(
    NEON_PASSWORD,
  )}@${NEON_HOST}/${NEON_DB}?${QUERY_FLAGS}`;

  pool = new Pool({
    ssl: { rejectUnauthorized: false },
    connectionString,
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
  });

  return pool;
}

@Injectable()
export class PromptConfigService {
  async handleGet(req: Request) {
    const q: any = req.query || {};
    const promptNameRaw = q.prompt_name || q.promptName || q.scope;
    const promptName = promptNameRaw ? parsePromptName(promptNameRaw, false) : null;
    const includeGlobal = parseIncludeGlobal(req);

    const promptNames: string[] = [];
    if (promptName) {
      if (promptName !== 'global' && includeGlobal) promptNames.push('global');
      promptNames.push(promptName);
    }

    const uniquePromptNames = [...new Set(promptNames)];

    // Keep same constraint as the original code comment (`in`/lists are bounded).
    if (uniquePromptNames.length > 30) {
      throw new HttpError(400, 'Too many prompt names requested');
    }

    const client = await getPool().connect();
    try {
      const hasFilter = uniquePromptNames.length > 0;

      const res = hasFilter
        ? await client.query(
            `
            SELECT
              prompt_id, prompt_name, prompt, enabled, updated_at
            FROM prompt_config
            WHERE enabled = true
              AND prompt_name = ANY($1::text[])
            ORDER BY prompt_name, updated_at DESC
            `,
            [uniquePromptNames],
          )
        : await client.query(
            `
            SELECT
              prompt_id, prompt_name, prompt, enabled, updated_at
            FROM prompt_config
            WHERE enabled = true
            ORDER BY prompt_name, updated_at DESC
            `,
          );

      return {
        server_time: new Date().toISOString(),
        prompt_name: promptName,
        includeGlobal: includeGlobal && promptName !== 'global',
        prompts: res.rows || [],
      };
    } finally {
      client.release();
    }
  }

  async handlePost(rawBody: any) {
    const body = rawBody ?? {};

    const promptNameRaw = pick(body, 'prompt_name', 'promptName', 'scope');
    const promptName = parsePromptName(promptNameRaw, false);

    const prompt = (pick(body, 'prompt') ?? '').toString();
    const enabled = body.enabled === undefined ? true : Boolean(body.enabled);

    if (!prompt.trim()) throw new HttpError(400, '"prompt" is required');

    const client = await getPool().connect();
    try {
      const res = await client.query(
        `
        INSERT INTO prompt_config (prompt_name, prompt, enabled)
        VALUES ($1, $2, $3)
        RETURNING prompt_id, prompt_name, prompt, enabled, created_at, updated_at
        `,
        [promptName, prompt, enabled],
      );

      return { created: res.rows[0], server_time: new Date().toISOString() };
    } finally {
      client.release();
    }
  }

  async handleUpdate(req: Request) {
    const body = req.body ?? {};
    const prompt_id = parsePromptId(req, body);

    // allow partial updates
    const prompt =
      body.prompt === undefined ? undefined : (body.prompt ?? '').toString();
    const enabled =
      body.enabled === undefined ? undefined : Boolean(body.enabled);

    const rawPromptNameProvided =
      body.prompt_name !== undefined || body.promptName !== undefined || body.scope !== undefined;

    const rawPromptName = rawPromptNameProvided
      ? pick(body, 'prompt_name', 'promptName', 'scope')
      : undefined;

    const promptName =
      rawPromptName === undefined ? undefined : parsePromptName(rawPromptName, false);

    if (prompt !== undefined && !prompt.trim()) {
      throw new HttpError(400, '"prompt" cannot be empty');
    }

    // build dynamic SET list safely
    const sets: string[] = [];
    const vals: any[] = [];
    let i = 1;

    if (prompt !== undefined) {
      sets.push(`prompt = $${i++}`);
      vals.push(prompt);
    }

    if (promptName !== undefined) {
      sets.push(`prompt_name = $${i++}`);
      vals.push(promptName);
    }

    if (enabled !== undefined) {
      sets.push(`enabled = $${i++}`);
      vals.push(enabled);
    }

    if (sets.length === 0) {
      throw new HttpError(400, 'No fields to update (provide prompt, prompt_name, or enabled)');
    }

    vals.push(prompt_id);

    const client = await getPool().connect();
    try {
      const res = await client.query(
        `
        UPDATE prompt_config
        SET ${sets.join(', ')}
        WHERE prompt_id = $${i}
        RETURNING prompt_id, prompt_name, prompt, enabled, created_at, updated_at
        `,
        vals,
      );

      if (!res.rows[0]) throw new HttpError(404, 'prompt_id not found');

      return { updated: res.rows[0], server_time: new Date().toISOString() };
    } finally {
      client.release();
    }
  }

  async handleDelete(req: Request) {
    const body = req.body ?? {};
    const prompt_id = parsePromptId(req, body);

    const client = await getPool().connect();
    try {
      // soft delete
      const res = await client.query(
        `
        UPDATE prompt_config
        SET enabled = false
        WHERE prompt_id = $1
        RETURNING prompt_id, prompt_name, prompt, enabled, created_at, updated_at
        `,
        [prompt_id],
      );

      if (!res.rows[0]) throw new HttpError(404, 'prompt_id not found');

      return { deleted: res.rows[0], server_time: new Date().toISOString() };
    } finally {
      client.release();
    }
  }
}
