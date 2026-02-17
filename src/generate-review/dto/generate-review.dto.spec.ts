import { validateGenerateReviewDto } from './generate-review.dto';

function basePayload() {
  return {
    spoiler_mode: 'non-spoiler',
    title: {
      title_id: 'tt3118452',
      title: 'The Circle',
      year: 2017,
      genres: ['Reality TV', 'Competition'],
      plot: 'Contestants live in isolation.',
      runtime_minutes: 97,
    },
    gate_state: {
      can_speak: true,
      reason: null,
      updated_at: '2026-02-17T08:00:00.000Z',
    },
    taste_snapshot: {
      version: 'v1',
      signals: {
        preferred_tones: ['psychological', 'social-strategy'],
      },
      summary: 'Tends to like social strategy.',
    },
    taste_anchors: [
      {
        anchor_id: 'a_social-strategy',
        label: 'social strategy',
        weight: 0.82,
        evidence: ['liked social games'],
      },
    ],
    user_ratings: [
      {
        title_id: 'tt2267998',
        rating: 4.5,
        rated_at: '2025-11-03T10:00:00.000Z',
      },
    ],
    contradictions: {
      unresolved_count: 1,
      examples: [{ type: 'tone_mismatch' }],
    },
    drift: {
      trend: 'shifting_toward_documentary',
      confidence: 0.58,
      signals: [{ signal: 'recent_likes_more_serious', weight: 0.6 }],
    },
    interactions: {
      views: 14,
      skips: 3,
      saves: 6,
      likes: 9,
      listAdds: 2,
      totalReviewInteractions: 5,
    },
    force_refresh: false,
    provider: 'openai',
  };
}

describe('validateGenerateReviewDto', () => {
  it('accepts snake_case bundle and computes totalReviewInteractions', () => {
    const validation = validateGenerateReviewDto(basePayload());
    expect(validation.errors).toEqual([]);
    expect(validation.value?.interactions.totalReviewInteractions).toBe(34);
  });

  it('rejects missing taste_snapshot.version', () => {
    const payload = basePayload();
    delete payload.taste_snapshot.version;
    const validation = validateGenerateReviewDto(payload);
    expect(validation.value).toBeNull();
    expect(validation.errors).toContain('taste_snapshot.version is required');
  });

  it('rejects taste_anchors above max size', () => {
    const payload = basePayload();
    payload.taste_anchors = Array.from({ length: 51 }, (_, i) => ({
      anchor_id: `a_${i}`,
      label: `anchor ${i}`,
      weight: 0.5,
      evidence: [],
    }));
    const validation = validateGenerateReviewDto(payload);
    expect(validation.value).toBeNull();
    expect(validation.errors).toContain('taste_anchors exceeds max size of 50');
  });

  it('rejects contradictions count mismatch', () => {
    const payload = basePayload();
    payload.contradictions.unresolved_count = 3;
    const validation = validateGenerateReviewDto(payload);
    expect(validation.value).toBeNull();
    expect(validation.errors).toContain(
      'contradictions.unresolved_count must match contradictions.examples.length',
    );
  });
});
