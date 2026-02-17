import { Injectable } from '@nestjs/common';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';

import type {
  ReviewProvider,
  SpoilerMode,
  ValidatedGateState,
  ValidatedGenerateReviewInput,
  ValidatedReviewTitle,
} from './dto/generate-review.dto';

const REVIEW_DECISIONS = [
  'SPEAK',
  'SILENCE',
  'EXPLAIN_CONFLICT',
  'ASK_LIGHT_QUESTION',
] as const;
const PROMPT_VERSION = 'v2-spoiler-mode-long-form';

type ReviewDecisionType = (typeof REVIEW_DECISIONS)[number];

type ReviewGate = {
  canSpeak: boolean;
  reason: string | null;
  updatedAt?: string;
};

type TitleEvidence = {
  titleId: string;
  title: string;
  year: number | null;
  genres: string[];
  plot: string;
  runtimeMinutes: number | null;
};

type TasteEvidence = {
  title: TitleEvidence;
  spoilerMode: SpoilerMode;
  gate: ReviewGate;
  tasteSnapshot: Record<string, unknown>;
  tasteAnchors: Array<{
    anchorId: string;
    label: string;
    weight: number;
    evidence: string[];
  }>;
  userRatings: Array<{
    titleId: string;
    rating: number;
    ratedAt?: string;
  }>;
  contradictions: {
    unresolvedCount: number;
    examples: Array<Record<string, unknown>>;
  };
  drift: {
    trend?: string;
    confidence?: number;
    signals: Array<Record<string, unknown>>;
  };
  interactions: {
    views: number;
    skips: number;
    saves: number;
    likes: number;
    listAdds: number;
    totalReviewInteractions: number;
  };
  wantToWatchRationale: string | null;
};

type GeneratedReviewRecord = {
  id: string;
  userKey: string;
  titleId: string;
  spoilerMode: SpoilerMode;
  promptVersion: string;
  provider: ReviewProvider | null;
  traceId: string;
  createdAt: string;
  result: ReviewResult;
};

type ReviewStore = {
  reviewGates: Record<string, ReviewGate>;
  generatedReviews: GeneratedReviewRecord[];
};

type LlmRouterResponse = {
  provider: ReviewProvider | null;
  outputText: string;
};

export type ReviewResult = {
  decisionType: ReviewDecisionType;
  confidence: number;
  reviewText?: string;
  silenceReason?: string;
  conflictExplanation?: string;
  lightQuestion?: string;
  anchorsUsed?: string[];
  mismatches?: unknown[];
  structuralMatch?: boolean;
};

export type GenerateReviewContext = {
  traceId: string;
  authorization?: string;
  baseUrl: string;
  userKey: string;
};

export type GenerateReviewServiceResult = {
  statusCode: number;
  errors: string[];
  data: ReviewResult | null;
};

class ServiceError extends Error {
  constructor(
    readonly statusCode: number,
    readonly publicMessage: string,
  ) {
    super(publicMessage);
  }
}

@Injectable()
export class GenerateReviewService {
  async generateReview(
    input: ValidatedGenerateReviewInput,
    context: GenerateReviewContext,
  ): Promise<GenerateReviewServiceResult> {
    try {
      const store = await this.loadStore();
      const gate = this.resolveGate(store, context.userKey, input.gateState);
      const title = await this.resolveTitleEvidence(input.title, context);
      const evidence = this.buildTasteEvidence(input, title, gate);

      if (gate.canSpeak === false) {
        const silence: ReviewResult = {
          decisionType: 'SILENCE',
          confidence: 0,
          silenceReason: gate.reason || 'Review gate disabled',
        };

        await this.persistGeneratedReview(store, {
          userKey: context.userKey,
          titleId: title.titleId,
          spoilerMode: input.spoilerMode,
          promptVersion: PROMPT_VERSION,
          provider: input.provider ?? null,
          traceId: context.traceId,
          result: silence,
        });

        return { statusCode: 200, errors: [], data: silence };
      }

      if (!input.forceRefresh) {
        const cached = this.findCachedReview(store, context.userKey, title.titleId, input.spoilerMode);
        if (cached) return { statusCode: 200, errors: [], data: cached };
      }

      const prompts = this.buildPrompts(evidence);
      const llmResponse = await this.callLlmRouter(
        {
          provider: input.provider,
          input: prompts.input,
          system: prompts.system,
          metadata: {
            feature: 'generateReview',
            titleId: title.titleId,
            spoilerMode: input.spoilerMode,
            promptVersion: PROMPT_VERSION,
            tasteSnapshotVersion: input.tasteSnapshot.version,
            userKey: context.userKey,
          },
        },
        context,
      );

      const parsed = this.parseModelResult(llmResponse.outputText);

      await this.persistGeneratedReview(store, {
        userKey: context.userKey,
        titleId: title.titleId,
        spoilerMode: input.spoilerMode,
        promptVersion: PROMPT_VERSION,
        provider: llmResponse.provider ?? input.provider ?? null,
        traceId: context.traceId,
        result: parsed,
      });

      return { statusCode: 200, errors: [], data: parsed };
    } catch (error: unknown) {
      if (error instanceof ServiceError) {
        return {
          statusCode: error.statusCode,
          errors: [error.publicMessage],
          data: null,
        };
      }

      return {
        statusCode: 500,
        errors: ['Unexpected error while generating review'],
        data: null,
      };
    }
  }

  private buildPrompts(evidence: TasteEvidence): { system: string; input: string } {
    const spoilerPolicy =
      evidence.spoilerMode === 'spoiler'
        ? [
            'MODE POLICY: spoiler',
            'Treat spoiler_mode as fundamental context.',
            'You must include explicit spoilers: key plot turns, character reveals, conflicts, and ending outcomes.',
            'Write with enough narrative detail that the user feels like they have already seen the movie/show.',
          ].join('\n')
        : [
            'MODE POLICY: non-spoiler',
            'Treat spoiler_mode as fundamental context.',
            'Do not reveal twists, reveals, endings, eliminations, killer identity, or final outcomes.',
            'Keep plot references high-level and safe for first-time viewers.',
          ].join('\n');

    const system = [
      'You are the Justus Taste Engine.',
      'Return JSON only. Do not wrap output in markdown.',
      'Required keys: decision_type, confidence.',
      'decision_type must be one of: SPEAK, SILENCE, EXPLAIN_CONFLICT, ASK_LIGHT_QUESTION.',
      'Required content by decision_type:',
      '- SPEAK => review_text',
      '- SILENCE => silence_reason',
      '- EXPLAIN_CONFLICT => conflict_explanation',
      '- ASK_LIGHT_QUESTION => light_question',
      'If decision_type is SPEAK, review_text must be detailed and at least 500 words.',
      'Optional keys: anchors_used (string[]), mismatches (array), structural_match (boolean).',
      spoilerPolicy,
    ].join('\n');

    const input = [
      `PROMPT_VERSION: ${PROMPT_VERSION}`,
      `REVIEW_MODE: ${evidence.spoilerMode}`,
      evidence.spoilerMode === 'spoiler'
        ? 'Write a spoiler review that openly discusses plot, story progression, character arcs, and ending-level outcomes.'
        : 'Write a non-spoiler review that avoids ending-level details and major reveals.',
      'Generate one review decision from this validated user taste bundle.',
      JSON.stringify(evidence),
    ].join('\n');

    return { system, input };
  }

  private buildTasteEvidence(
    input: ValidatedGenerateReviewInput,
    title: TitleEvidence,
    gate: ReviewGate,
  ): TasteEvidence {
    return {
      title,
      spoilerMode: input.spoilerMode,
      gate,
      tasteSnapshot: {
        version: input.tasteSnapshot.version,
        signals: input.tasteSnapshot.signals,
        ...(input.tasteSnapshot.summary ? { summary: input.tasteSnapshot.summary } : {}),
      },
      tasteAnchors: input.tasteAnchors,
      userRatings: input.userRatings,
      contradictions: input.contradictions,
      drift: input.drift,
      interactions: input.interactions,
      wantToWatchRationale: input.wantToWatchRationale ?? null,
    };
  }

  private resolveGate(
    store: ReviewStore,
    userKey: string,
    inputGate: ValidatedGateState | undefined,
  ): ReviewGate {
    const serverGate = store.reviewGates[userKey] ?? store.reviewGates.global;
    if (serverGate) {
      return {
        canSpeak: Boolean(serverGate.canSpeak),
        reason: this.asOptionalString(serverGate.reason) ?? null,
        ...(serverGate.updatedAt ? { updatedAt: serverGate.updatedAt } : {}),
      };
    }

    if (!inputGate) {
      throw new ServiceError(
        400,
        'gate_state.can_speak must be provided when no server gate is configured',
      );
    }

    return {
      canSpeak: inputGate.canSpeak,
      reason: inputGate.reason,
      ...(inputGate.updatedAt ? { updatedAt: inputGate.updatedAt } : {}),
    };
  }

  private async resolveTitleEvidence(
    inputTitle: ValidatedReviewTitle,
    context: GenerateReviewContext,
  ): Promise<TitleEvidence> {
    const provided: TitleEvidence = {
      titleId: inputTitle.titleId,
      title: inputTitle.title ?? '',
      year: typeof inputTitle.year === 'number' ? inputTitle.year : null,
      genres: Array.isArray(inputTitle.genres) ? inputTitle.genres : [],
      plot: inputTitle.plot ?? '',
      runtimeMinutes:
        typeof inputTitle.runtimeMinutes === 'number' ? inputTitle.runtimeMinutes : null,
    };

    if (provided.title) return provided;

    const lookedUp = await this.loadTitleEvidence(inputTitle.titleId, context);
    return {
      titleId: lookedUp.titleId || provided.titleId,
      title: lookedUp.title || provided.title,
      year: lookedUp.year ?? provided.year,
      genres: lookedUp.genres.length ? lookedUp.genres : provided.genres,
      plot: lookedUp.plot || provided.plot,
      runtimeMinutes: lookedUp.runtimeMinutes ?? provided.runtimeMinutes,
    };
  }

  private async loadTitleEvidence(titleId: string, context: GenerateReviewContext): Promise<TitleEvidence> {
    const url = `${this.baseUrl(context.baseUrl)}/api/justus/titleDetail?imdbId=${encodeURIComponent(
      titleId,
    )}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          ...(context.authorization ? { Authorization: context.authorization } : {}),
          'x-trace-id': context.traceId,
        },
      });
    } catch {
      throw new ServiceError(502, 'Failed to resolve title information');
    }

    const payload = await this.readJsonSafe(response);
    const statusCode = this.readStatusCode(payload, response.status);

    if (statusCode >= 500) throw new ServiceError(502, 'Failed to resolve title information');
    if (statusCode >= 400) throw new ServiceError(404, 'Title not found');

    const info = this.asObject(payload?.info);
    const title = this.asOptionalString(info?.title);
    if (!title) throw new ServiceError(404, 'Title not found');

    return {
      titleId: this.asOptionalString(info?.imdbId) || titleId,
      title,
      year: this.parseIntLike(info?.year),
      genres: this.splitCsv(info?.genre),
      plot: this.asOptionalString(info?.plot) || '',
      runtimeMinutes: this.parseIntLike(info?.runtime),
    };
  }

  private async callLlmRouter(
    payload: {
      provider?: ReviewProvider;
      input: string;
      system?: string;
      metadata: Record<string, unknown>;
    },
    context: GenerateReviewContext,
  ): Promise<LlmRouterResponse> {
    const url = `${this.baseUrl(context.baseUrl)}/api/justus/llmRouter`;
    let response: Response;

    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(context.authorization ? { Authorization: context.authorization } : {}),
          'x-trace-id': context.traceId,
        },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new ServiceError(502, 'llmRouter request failed');
    }

    const parsed = await this.readJsonSafe(response);
    if (!response.ok) {
      const errors = Array.isArray(parsed?.errors)
        ? parsed.errors.filter((item) => typeof item === 'string')
        : [];
      throw new ServiceError(502, errors[0] || `llmRouter failed with status ${response.status}`);
    }

    const outputText =
      this.asOptionalString(parsed?.output_text) || this.asOptionalString(parsed?.outputText);
    if (!outputText) throw new ServiceError(502, 'llmRouter returned no output_text');

    const providerRaw = this.asOptionalString(parsed?.provider)?.toLowerCase() ?? null;
    const provider =
      providerRaw === 'openai' || providerRaw === 'deepseek'
        ? (providerRaw as ReviewProvider)
        : null;

    return { provider, outputText };
  }

  private parseModelResult(outputText: string): ReviewResult {
    const cleaned = this.extractJsonPayload(outputText);

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new ServiceError(502, 'Invalid model output JSON');
    }

    const root = this.asObject(parsed);
    if (!root) throw new ServiceError(502, 'Invalid model output shape');

    const decisionValue =
      this.asOptionalString(root.decision_type) || this.asOptionalString(root.decisionType);
    if (!decisionValue || !REVIEW_DECISIONS.includes(decisionValue as ReviewDecisionType)) {
      throw new ServiceError(502, 'Invalid decision_type in model output');
    }

    const confidence = this.asNumber(root.confidence);
    if (confidence === null) throw new ServiceError(502, 'confidence must be a number');

    const decisionType = decisionValue as ReviewDecisionType;
    const result: ReviewResult = { decisionType, confidence };

    if (decisionType === 'SPEAK') {
      const reviewText =
        this.asOptionalString(root.review_text) || this.asOptionalString(root.reviewText);
      if (!reviewText) throw new ServiceError(502, 'review_text is required for SPEAK');
      if (this.wordCount(reviewText) < 500) {
        throw new ServiceError(502, 'review_text must be at least 500 words for SPEAK');
      }
      result.reviewText = reviewText;
    }

    if (decisionType === 'SILENCE') {
      const silenceReason =
        this.asOptionalString(root.silence_reason) ||
        this.asOptionalString(root.silenceReason) ||
        this.asOptionalString(root.reason);
      if (!silenceReason) throw new ServiceError(502, 'silence_reason is required for SILENCE');
      result.silenceReason = silenceReason;
    }

    if (decisionType === 'EXPLAIN_CONFLICT') {
      const conflictExplanation =
        this.asOptionalString(root.conflict_explanation) ||
        this.asOptionalString(root.conflictExplanation);
      if (!conflictExplanation) {
        throw new ServiceError(502, 'conflict_explanation is required for EXPLAIN_CONFLICT');
      }
      result.conflictExplanation = conflictExplanation;
    }

    if (decisionType === 'ASK_LIGHT_QUESTION') {
      const lightQuestion =
        this.asOptionalString(root.light_question) || this.asOptionalString(root.lightQuestion);
      if (!lightQuestion) {
        throw new ServiceError(502, 'light_question is required for ASK_LIGHT_QUESTION');
      }
      result.lightQuestion = lightQuestion;
    }

    const anchorsUsed =
      this.asStringArray(root.anchors_used).length > 0
        ? this.asStringArray(root.anchors_used)
        : this.asStringArray(root.anchorsUsed);
    if (anchorsUsed.length > 0) result.anchorsUsed = anchorsUsed;

    const mismatches = Array.isArray(root.mismatches) ? root.mismatches : [];
    if (mismatches.length > 0) result.mismatches = mismatches;

    const structuralMatch =
      typeof root.structural_match === 'boolean'
        ? root.structural_match
        : typeof root.structuralMatch === 'boolean'
          ? root.structuralMatch
          : null;
    if (structuralMatch !== null) result.structuralMatch = structuralMatch;

    return result;
  }

  private extractJsonPayload(raw: string): string {
    const trimmed = raw.trim();
    const fenced = trimmed.match(/^```[a-zA-Z0-9_-]*\s*([\s\S]*?)\s*```$/);
    const withoutFence = fenced ? fenced[1].trim() : trimmed;

    const firstBrace = withoutFence.indexOf('{');
    const lastBrace = withoutFence.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return withoutFence.slice(firstBrace, lastBrace + 1);
    }

    return withoutFence;
  }

  private findCachedReview(
    store: ReviewStore,
    userKey: string,
    titleId: string,
    spoilerMode: SpoilerMode,
  ): ReviewResult | null {
    const review = [...store.generatedReviews]
      .reverse()
      .find(
        (row) =>
          row.userKey === userKey &&
          row.titleId === titleId &&
          row.spoilerMode === spoilerMode &&
          row.promptVersion === PROMPT_VERSION &&
          row.result.decisionType !== 'SILENCE',
      );
    return review?.result ?? null;
  }

  private async persistGeneratedReview(
    store: ReviewStore,
    row: {
      userKey: string;
      titleId: string;
      spoilerMode: SpoilerMode;
      promptVersion: string;
      provider: ReviewProvider | null;
      traceId: string;
      result: ReviewResult;
    },
  ): Promise<void> {
    store.generatedReviews.push({
      id: randomUUID(),
      userKey: row.userKey,
      titleId: row.titleId,
      spoilerMode: row.spoilerMode,
      promptVersion: row.promptVersion,
      provider: row.provider,
      traceId: row.traceId,
      createdAt: new Date().toISOString(),
      result: row.result,
    });

    await this.saveStore(store);
  }

  private async loadStore(): Promise<ReviewStore> {
    const filePath = this.storePath();
    try {
      const raw = await readFile(filePath, 'utf8');
      const parsed = JSON.parse(raw) as Record<string, unknown>;

      const reviewGates = this.asObject(parsed.reviewGates) ?? {};
      const generatedReviews = Array.isArray(parsed.generatedReviews) ? parsed.generatedReviews : [];

      const normalizedGates: Record<string, ReviewGate> = {};
      for (const [key, value] of Object.entries(reviewGates)) {
        const gate = this.asObject(value);
        if (!gate || typeof gate.canSpeak !== 'boolean') continue;
        normalizedGates[key] = {
          canSpeak: gate.canSpeak,
          reason: this.asOptionalString(gate.reason) ?? null,
          ...(this.asOptionalString(gate.updatedAt)
            ? { updatedAt: this.asOptionalString(gate.updatedAt) as string }
            : {}),
        };
      }

      const normalizedReviews: GeneratedReviewRecord[] = generatedReviews
        .map((item) => this.normalizeGeneratedReview(item))
        .filter((item): item is GeneratedReviewRecord => Boolean(item));

      return {
        reviewGates: normalizedGates,
        generatedReviews: normalizedReviews,
      };
    } catch {
      return {
        reviewGates: {},
        generatedReviews: [],
      };
    }
  }

  private normalizeGeneratedReview(item: unknown): GeneratedReviewRecord | null {
    const row = this.asObject(item);
    if (!row) return null;

    const userKey = this.asOptionalString(row.userKey);
    const titleId = this.asOptionalString(row.titleId);
    const spoilerMode = this.asOptionalString(row.spoilerMode);
    const traceId = this.asOptionalString(row.traceId);
    const createdAt = this.asOptionalString(row.createdAt);
    const result = this.normalizeReviewResult(row.result);

    if (!userKey || !titleId || !traceId || !createdAt || !result) return null;
    if (spoilerMode !== 'spoiler' && spoilerMode !== 'non-spoiler') return null;

    const providerRaw = this.asOptionalString(row.provider)?.toLowerCase() ?? null;
    const provider =
      providerRaw === 'openai' || providerRaw === 'deepseek'
        ? (providerRaw as ReviewProvider)
        : null;

    return {
      id: this.asOptionalString(row.id) || randomUUID(),
      userKey,
      titleId,
      spoilerMode,
      promptVersion: this.asOptionalString(row.promptVersion) || 'legacy-v1',
      provider,
      traceId,
      createdAt,
      result,
    };
  }

  private normalizeReviewResult(input: unknown): ReviewResult | null {
    const root = this.asObject(input);
    if (!root) return null;

    const decisionType = this.asOptionalString(root.decisionType);
    const confidence = this.asNumber(root.confidence);
    if (!decisionType || confidence === null) return null;
    if (!REVIEW_DECISIONS.includes(decisionType as ReviewDecisionType)) return null;

    const out: ReviewResult = {
      decisionType: decisionType as ReviewDecisionType,
      confidence,
    };

    const reviewText = this.asOptionalString(root.reviewText);
    if (reviewText) out.reviewText = reviewText;

    const silenceReason = this.asOptionalString(root.silenceReason);
    if (silenceReason) out.silenceReason = silenceReason;

    const conflictExplanation = this.asOptionalString(root.conflictExplanation);
    if (conflictExplanation) out.conflictExplanation = conflictExplanation;

    const lightQuestion = this.asOptionalString(root.lightQuestion);
    if (lightQuestion) out.lightQuestion = lightQuestion;

    if (this.asStringArray(root.anchorsUsed).length) {
      out.anchorsUsed = this.asStringArray(root.anchorsUsed);
    }
    if (Array.isArray(root.mismatches) && root.mismatches.length) {
      out.mismatches = root.mismatches;
    }
    if (typeof root.structuralMatch === 'boolean') {
      out.structuralMatch = root.structuralMatch;
    }

    return out;
  }

  private async saveStore(store: ReviewStore): Promise<void> {
    const filePath = this.storePath();
    await mkdir(dirname(filePath), { recursive: true });

    const tempPath = `${filePath}.${randomUUID()}.tmp`;
    await writeFile(tempPath, JSON.stringify(store, null, 2), 'utf8');
    await rename(tempPath, filePath);
  }

  private storePath(): string {
    const configured = process.env.GENERATE_REVIEW_STORE_PATH;
    if (configured && configured.trim()) return configured;
    return join(process.cwd(), 'temp', 'generate-review-store.json');
  }

  private readStatusCode(payload: Record<string, unknown> | null, fallback: number): number {
    const statusRaw = payload?.statusCode;
    if (typeof statusRaw === 'number' && Number.isFinite(statusRaw)) return Math.trunc(statusRaw);
    return fallback;
  }

  private baseUrl(raw: string): string {
    return raw.replace(/\/+$/, '');
  }

  private parseIntLike(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
    if (typeof value !== 'string') return null;
    const m = value.match(/\d+/);
    if (!m) return null;
    const n = parseInt(m[0], 10);
    return Number.isFinite(n) ? n : null;
  }

  private splitCsv(value: unknown): string[] {
    if (typeof value !== 'string') return [];
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => Boolean(item));
  }

  private asOptionalString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed || null;
  }

  private asNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value;

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return null;
      const parsed = Number(trimmed);
      if (Number.isFinite(parsed)) return parsed;
    }

    return null;
  }

  private asObject(value: unknown): Record<string, any> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    return value as Record<string, any>;
  }

  private asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => Boolean(item));
  }

  private wordCount(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((token) => Boolean(token)).length;
  }

  private async readJsonSafe(response: Response): Promise<Record<string, any> | null> {
    const text = await response.text().catch(() => '');
    if (!text) return null;
    try {
      return JSON.parse(text) as Record<string, any>;
    } catch {
      return null;
    }
  }
}
