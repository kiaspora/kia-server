export const SPOILER_MODES = ['spoiler', 'non-spoiler'] as const;
export const REVIEW_PROVIDERS = ['openai', 'deepseek'] as const;

export type SpoilerMode = (typeof SPOILER_MODES)[number];
export type ReviewProvider = (typeof REVIEW_PROVIDERS)[number];

export type ValidatedReviewTitle = {
  titleId: string;
  title?: string;
  year?: number;
  genres?: string[];
  plot?: string;
  runtimeMinutes?: number;
};

export type ValidatedGateState = {
  canSpeak: boolean;
  reason: string | null;
  updatedAt?: string;
};

export type ValidatedTasteAnchor = {
  anchorId: string;
  label: string;
  weight: number;
  evidence: string[];
};

export type ValidatedUserRating = {
  titleId: string;
  rating: number;
  ratedAt?: string;
};

export type ValidatedContradictions = {
  unresolvedCount: number;
  examples: Array<Record<string, unknown>>;
};

export type ValidatedDrift = {
  trend?: string;
  confidence?: number;
  signals: Array<Record<string, unknown>>;
};

export type ValidatedInteractions = {
  views: number;
  skips: number;
  saves: number;
  likes: number;
  listAdds: number;
  totalReviewInteractions: number;
};

export type ValidatedTasteSnapshot = {
  version: string;
  signals: Record<string, unknown>;
  summary?: string;
};

export class GenerateReviewDto {
  titleId?: unknown;
  title_id?: unknown;
  spoilerMode?: unknown;
  spoiler_mode?: unknown;
  forceRefresh?: unknown;
  force_refresh?: unknown;
  provider?: unknown;
  title?: unknown;
  gateState?: unknown;
  gate_state?: unknown;
  tasteSnapshot?: unknown;
  taste_snapshot?: unknown;
  tasteAnchors?: unknown;
  taste_anchors?: unknown;
  userRatings?: unknown;
  user_ratings?: unknown;
  contradictions?: unknown;
  drift?: unknown;
  interactions?: unknown;
  wantToWatchRationale?: unknown;
  want_to_watch_rationale?: unknown;
}

export type ValidatedGenerateReviewInput = {
  title: ValidatedReviewTitle;
  spoilerMode: SpoilerMode;
  gateState?: ValidatedGateState;
  tasteSnapshot: ValidatedTasteSnapshot;
  tasteAnchors: ValidatedTasteAnchor[];
  userRatings: ValidatedUserRating[];
  contradictions: ValidatedContradictions;
  drift: ValidatedDrift;
  interactions: ValidatedInteractions;
  wantToWatchRationale?: string;
  forceRefresh: boolean;
  provider?: ReviewProvider;
};

export function validateGenerateReviewDto(
  dto: GenerateReviewDto | null | undefined,
): { value: ValidatedGenerateReviewInput | null; errors: string[] } {
  const errors: string[] = [];
  const body = asObject(dto) ?? {};

  const spoilerModeRaw = pick(body, ['spoilerMode', 'spoiler_mode']);
  const spoilerMode =
    typeof spoilerModeRaw === 'string' ? spoilerModeRaw.trim().toLowerCase() : '';
  if (!SPOILER_MODES.includes(spoilerMode as SpoilerMode)) {
    errors.push('spoiler_mode must be "spoiler" or "non-spoiler"');
  }

  const forceRefreshRaw = pick(body, ['forceRefresh', 'force_refresh']);
  let forceRefresh = false;
  if (forceRefreshRaw !== undefined) {
    if (typeof forceRefreshRaw !== 'boolean') {
      errors.push('force_refresh must be a boolean when provided');
    } else {
      forceRefresh = forceRefreshRaw;
    }
  }

  const providerRaw = pick(body, ['provider']);
  let provider: ReviewProvider | undefined;
  if (providerRaw !== undefined) {
    if (typeof providerRaw !== 'string') {
      errors.push('provider must be "openai" or "deepseek" when provided');
    } else {
      const normalized = providerRaw.trim().toLowerCase();
      if (!REVIEW_PROVIDERS.includes(normalized as ReviewProvider)) {
        errors.push('provider must be "openai" or "deepseek" when provided');
      } else {
        provider = normalized as ReviewProvider;
      }
    }
  }

  const title = validateTitle(body, errors);
  const gateState = validateGateState(body, errors);
  const tasteSnapshot = validateTasteSnapshot(body, errors);
  const tasteAnchors = validateTasteAnchors(body, errors);
  const userRatings = validateUserRatings(body, errors);
  const contradictions = validateContradictions(body, errors);
  const drift = validateDrift(body, errors);
  const interactions = validateInteractions(body, errors);

  const rationaleRaw = pick(body, ['wantToWatchRationale', 'want_to_watch_rationale']);
  const wantToWatchRationale = typeof rationaleRaw === 'string' ? rationaleRaw.trim() : '';

  if (errors.length) return { value: null, errors };

  return {
    value: {
      title: title as ValidatedReviewTitle,
      spoilerMode: spoilerMode as SpoilerMode,
      ...(gateState ? { gateState } : {}),
      tasteSnapshot: tasteSnapshot as ValidatedTasteSnapshot,
      tasteAnchors: tasteAnchors as ValidatedTasteAnchor[],
      userRatings: userRatings as ValidatedUserRating[],
      contradictions: contradictions as ValidatedContradictions,
      drift: drift as ValidatedDrift,
      interactions: interactions as ValidatedInteractions,
      ...(wantToWatchRationale ? { wantToWatchRationale } : {}),
      forceRefresh,
      ...(provider ? { provider } : {}),
    },
    errors: [],
  };
}

function validateTitle(
  body: Record<string, unknown>,
  errors: string[],
): ValidatedReviewTitle | null {
  const titleObj = asObject(pick(body, ['title']));
  const topLevelTitleIdRaw = pick(body, ['titleId', 'title_id']);

  const titleIdFromTitle = titleObj
    ? pick(titleObj, ['titleId', 'title_id'])
    : undefined;
  const titleIdRaw = titleIdFromTitle ?? topLevelTitleIdRaw;
  const titleId = typeof titleIdRaw === 'string' ? titleIdRaw.trim() : '';

  if (titleObj && !titleIdFromTitle) {
    errors.push('title.title_id is required when title object is provided');
  }
  if (!titleId) {
    errors.push('title_id is required (top-level or inside title)');
  }

  if (!titleObj) {
    return titleId ? { titleId } : null;
  }

  const yearRaw = pick(titleObj, ['year']);
  const runtimeRaw = pick(titleObj, ['runtimeMinutes', 'runtime_minutes']);
  const genresRaw = pick(titleObj, ['genres']);

  const year = asInteger(yearRaw);
  if (yearRaw !== undefined && year === null) {
    errors.push('title.year must be an integer when provided');
  }

  const runtimeMinutes = asInteger(runtimeRaw);
  if (runtimeRaw !== undefined && runtimeMinutes === null) {
    errors.push('title.runtime_minutes must be an integer when provided');
  }

  const genres = asStringArray(genresRaw);
  if (genresRaw !== undefined && !Array.isArray(genresRaw)) {
    errors.push('title.genres must be an array of strings when provided');
  }

  const result: ValidatedReviewTitle = { titleId };
  const titleText = asTrimmedString(pick(titleObj, ['title']));
  const plot = asTrimmedString(pick(titleObj, ['plot']));
  if (titleText) result.title = titleText;
  if (plot) result.plot = plot;
  if (year !== null) result.year = year;
  if (runtimeMinutes !== null) result.runtimeMinutes = runtimeMinutes;
  if (genres.length) result.genres = genres;
  return result;
}

function validateGateState(
  body: Record<string, unknown>,
  errors: string[],
): ValidatedGateState | undefined {
  const gateObj = asObject(pick(body, ['gateState', 'gate_state']));
  if (!gateObj) return undefined;

  const canSpeakRaw = pick(gateObj, ['canSpeak', 'can_speak']);
  if (typeof canSpeakRaw !== 'boolean') {
    errors.push('gate_state.can_speak must be a boolean when gate_state is provided');
    return undefined;
  }

  const reasonRaw = pick(gateObj, ['reason']);
  const updatedAtRaw = pick(gateObj, ['updatedAt', 'updated_at']);

  const reason =
    reasonRaw === null
      ? null
      : typeof reasonRaw === 'string'
        ? reasonRaw.trim() || null
        : null;

  const updatedAt = typeof updatedAtRaw === 'string' ? updatedAtRaw.trim() : '';

  return {
    canSpeak: canSpeakRaw,
    reason,
    ...(updatedAt ? { updatedAt } : {}),
  };
}

function validateTasteSnapshot(
  body: Record<string, unknown>,
  errors: string[],
): ValidatedTasteSnapshot | null {
  const snapshotObj = asObject(pick(body, ['tasteSnapshot', 'taste_snapshot']));
  if (!snapshotObj) {
    errors.push('taste_snapshot is required');
    return null;
  }

  const version = asTrimmedString(pick(snapshotObj, ['version']));
  if (!version) {
    errors.push('taste_snapshot.version is required');
  }

  const signals = asObject(pick(snapshotObj, ['signals'])) ?? {};
  const summary = asTrimmedString(pick(snapshotObj, ['summary']));

  if (!version) return null;
  return {
    version,
    signals,
    ...(summary ? { summary } : {}),
  };
}

function validateTasteAnchors(
  body: Record<string, unknown>,
  errors: string[],
): ValidatedTasteAnchor[] | null {
  const anchorsRaw = pick(body, ['tasteAnchors', 'taste_anchors']);
  if (!Array.isArray(anchorsRaw)) {
    errors.push('taste_anchors is required and must be an array');
    return null;
  }

  if (anchorsRaw.length > 50) {
    errors.push('taste_anchors exceeds max size of 50');
  }

  const anchors: ValidatedTasteAnchor[] = [];
  anchorsRaw.forEach((item, idx) => {
    const row = asObject(item);
    if (!row) {
      errors.push(`taste_anchors[${idx}] must be an object`);
      return;
    }

    const anchorId = asTrimmedString(pick(row, ['anchorId', 'anchor_id']));
    const label = asTrimmedString(pick(row, ['label']));
    const weight = asFiniteNumber(pick(row, ['weight']));
    const evidence = asStringArray(pick(row, ['evidence']));

    if (!anchorId) errors.push(`taste_anchors[${idx}].anchor_id is required`);
    if (!label) errors.push(`taste_anchors[${idx}].label is required`);
    if (weight === null) errors.push(`taste_anchors[${idx}].weight must be a number`);

    if (anchorId && label && weight !== null) {
      anchors.push({ anchorId, label, weight, evidence });
    }
  });

  return anchors;
}

function validateUserRatings(
  body: Record<string, unknown>,
  errors: string[],
): ValidatedUserRating[] | null {
  const ratingsRaw = pick(body, ['userRatings', 'user_ratings']);
  if (!Array.isArray(ratingsRaw)) {
    errors.push('user_ratings is required and must be an array');
    return null;
  }

  if (ratingsRaw.length > 500) {
    errors.push('user_ratings exceeds max size of 500');
  }

  const ratings: ValidatedUserRating[] = [];
  ratingsRaw.forEach((item, idx) => {
    const row = asObject(item);
    if (!row) {
      errors.push(`user_ratings[${idx}] must be an object`);
      return;
    }

    const titleId = asTrimmedString(pick(row, ['titleId', 'title_id']));
    const rating = asFiniteNumber(pick(row, ['rating']));
    const ratedAt = asTrimmedString(pick(row, ['ratedAt', 'rated_at']));

    if (!titleId) errors.push(`user_ratings[${idx}].title_id is required`);
    if (rating === null) errors.push(`user_ratings[${idx}].rating must be a number`);

    if (titleId && rating !== null) {
      ratings.push({
        titleId,
        rating,
        ...(ratedAt ? { ratedAt } : {}),
      });
    }
  });

  return ratings;
}

function validateContradictions(
  body: Record<string, unknown>,
  errors: string[],
): ValidatedContradictions | null {
  const contradictionsObj = asObject(pick(body, ['contradictions']));
  if (!contradictionsObj) {
    errors.push('contradictions is required');
    return null;
  }

  const unresolvedCountRaw = pick(contradictionsObj, ['unresolvedCount', 'unresolved_count']);
  const unresolvedCount = asInteger(unresolvedCountRaw);
  if (unresolvedCount === null || unresolvedCount < 0) {
    errors.push('contradictions.unresolved_count must be a non-negative integer');
  }

  const examplesRaw = pick(contradictionsObj, ['examples']);
  if (!Array.isArray(examplesRaw)) {
    errors.push('contradictions.examples must be an array');
    return null;
  }

  const examples = examplesRaw.filter(
    (item): item is Record<string, unknown> =>
      Boolean(item && typeof item === 'object' && !Array.isArray(item)),
  );
  if (examples.length !== examplesRaw.length) {
    errors.push('contradictions.examples entries must be objects');
  }

  if (unresolvedCount !== null && unresolvedCount !== examples.length) {
    errors.push('contradictions.unresolved_count must match contradictions.examples.length');
  }

  if (unresolvedCount === null) return null;
  return { unresolvedCount, examples };
}

function validateDrift(body: Record<string, unknown>, errors: string[]): ValidatedDrift | null {
  const driftObj = asObject(pick(body, ['drift']));
  if (!driftObj) {
    errors.push('drift is required');
    return null;
  }

  const trend = asTrimmedString(pick(driftObj, ['trend']));
  const confidence = asFiniteNumber(pick(driftObj, ['confidence']));
  const signalsRaw = pick(driftObj, ['signals']);

  if (!Array.isArray(signalsRaw)) {
    errors.push('drift.signals must be an array');
    return null;
  }

  const signals = signalsRaw.filter(
    (item): item is Record<string, unknown> =>
      Boolean(item && typeof item === 'object' && !Array.isArray(item)),
  );
  if (signals.length !== signalsRaw.length) {
    errors.push('drift.signals entries must be objects');
  }

  return {
    ...(trend ? { trend } : {}),
    ...(confidence !== null ? { confidence } : {}),
    signals,
  };
}

function validateInteractions(
  body: Record<string, unknown>,
  errors: string[],
): ValidatedInteractions | null {
  const interactionsObj = asObject(pick(body, ['interactions']));
  if (!interactionsObj) {
    errors.push('interactions is required');
    return null;
  }

  const views = nonNegativeInt(pick(interactionsObj, ['views']));
  const skips = nonNegativeInt(pick(interactionsObj, ['skips']));
  const saves = nonNegativeInt(pick(interactionsObj, ['saves']));
  const likes = nonNegativeInt(pick(interactionsObj, ['likes']));
  const listAdds = nonNegativeInt(pick(interactionsObj, ['listAdds', 'list_adds']));
  const totalReviewInteractionsRaw = pick(interactionsObj, [
    'totalReviewInteractions',
    'total_review_interactions',
  ]);
  const totalReviewInteractions = nonNegativeInt(totalReviewInteractionsRaw);

  if (views === null) errors.push('interactions.views must be a non-negative integer');
  if (skips === null) errors.push('interactions.skips must be a non-negative integer');
  if (saves === null) errors.push('interactions.saves must be a non-negative integer');
  if (likes === null) errors.push('interactions.likes must be a non-negative integer');
  if (listAdds === null) errors.push('interactions.listAdds must be a non-negative integer');
  if (totalReviewInteractionsRaw !== undefined && totalReviewInteractions === null) {
    errors.push('interactions.totalReviewInteractions must be a non-negative integer when provided');
  }

  if (views === null || skips === null || saves === null || likes === null || listAdds === null) {
    return null;
  }

  const computedTotal = views + skips + saves + likes + listAdds;

  return {
    views,
    skips,
    saves,
    likes,
    listAdds,
    totalReviewInteractions: computedTotal,
  };
}

function pick(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) return obj[key];
  }
  return undefined;
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asTrimmedString(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => Boolean(item));
}

function asInteger(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Number.isInteger(value) ? value : null;
}

function nonNegativeInt(value: unknown): number | null {
  const n = asInteger(value);
  if (n === null || n < 0) return null;
  return n;
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value;
}
