import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { GenerateReviewService } from './generate-review.service';
import type { ValidatedGenerateReviewInput } from './dto/generate-review.dto';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('GenerateReviewService', () => {
  let service: GenerateReviewService;
  let storePath: string;
  let fetchMock: jest.Mock;
  const longReviewText = Array.from({ length: 520 }, (_, i) => `detail${i + 1}`).join(' ');

  const validInput: ValidatedGenerateReviewInput = {
    title: {
      titleId: 'tt0133093',
    },
    spoilerMode: 'non-spoiler',
    gateState: {
      canSpeak: true,
      reason: null,
      updatedAt: '2026-02-17T08:00:00.000Z',
    },
    tasteSnapshot: {
      version: 'v1',
      signals: { preferred_tones: ['psychological'] },
      summary: 'Sample summary',
    },
    tasteAnchors: [
      {
        anchorId: 'a_social-strategy',
        label: 'social strategy',
        weight: 0.82,
        evidence: ['liked social games'],
      },
    ],
    userRatings: [{ titleId: 'tt0133093', rating: 3.5, ratedAt: '2026-02-01T10:00:00.000Z' }],
    contradictions: {
      unresolvedCount: 1,
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
      totalReviewInteractions: 34,
    },
    wantToWatchRationale: 'Interested in persuasion games.',
    forceRefresh: false,
    provider: 'openai',
  };

  const context = {
    traceId: 'trace-abc-123',
    authorization: 'Bearer test-token',
    baseUrl: 'http://localhost:3000',
    userKey: 'global',
  };

  beforeEach(async () => {
    service = new GenerateReviewService();
    storePath = join(process.cwd(), 'temp', `generate-review-store-${Date.now()}-${Math.random()}.json`);
    process.env.GENERATE_REVIEW_STORE_PATH = storePath;

    fetchMock = jest.fn();
    (global as any).fetch = fetchMock;
  });

  afterEach(async () => {
    delete process.env.GENERATE_REVIEW_STORE_PATH;
    await rm(storePath, { force: true });
    jest.resetAllMocks();
  });

  it('returns SILENCE when gate is false and persists result', async () => {
    await mkdir(dirname(storePath), { recursive: true });
    await writeFile(
      storePath,
      JSON.stringify(
        {
          reviewGates: {
            global: { canSpeak: false, reason: 'Need more ratings' },
          },
          generatedReviews: [],
        },
        null,
        2,
      ),
      'utf8',
    );

    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        statusCode: 200,
        info: { imdbId: 'tt0133093', title: 'The Matrix', year: '1999' },
      }),
    );

    const result = await service.generateReview(validInput, context);

    expect(result.statusCode).toBe(200);
    expect(result.errors).toEqual([]);
    expect(result.data).toEqual({
      decisionType: 'SILENCE',
      confidence: 0,
      silenceReason: 'Need more ratings',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const saved = JSON.parse(await readFile(storePath, 'utf8'));
    expect(saved.generatedReviews).toHaveLength(1);
    expect(saved.generatedReviews[0].result.decisionType).toBe('SILENCE');
  });

  it('calls llmRouter and rejects invalid decision_type', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        statusCode: 200,
        info: { imdbId: 'tt0133093', title: 'The Matrix', year: '1999' },
      }),
    );
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        provider: 'openai',
        output_text: JSON.stringify({
          decision_type: 'MAYBE',
          confidence: 0.77,
          review_text: 'Not valid',
        }),
      }),
    );

    const result = await service.generateReview(validInput, context);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.statusCode).toBe(502);
    expect(result.errors[0]).toContain('Invalid decision_type');
    expect(result.data).toBeNull();
  });

  it('requires client gate_state when server gate is missing', async () => {
    const inputWithoutGate = {
      ...validInput,
      gateState: undefined,
    };

    const result = await service.generateReview(inputWithoutGate, context);
    expect(result.statusCode).toBe(400);
    expect(result.errors[0]).toContain('gate_state.can_speak');
    expect(result.data).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(0);
  });

  it('parses fenced JSON model output', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        statusCode: 200,
        info: { imdbId: 'tt0133093', title: 'The Matrix', year: '1999' },
      }),
    );
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        provider: 'openai',
        output_text:
          '```json\n{"decision_type":"ASK_LIGHT_QUESTION","confidence":0.64,"light_question":"Do you prefer practical effects over CGI?"}\n```',
      }),
    );

    const result = await service.generateReview(validInput, context);

    expect(result.statusCode).toBe(200);
    expect(result.errors).toEqual([]);
    expect(result.data).toEqual({
      decisionType: 'ASK_LIGHT_QUESTION',
      confidence: 0.64,
      lightQuestion: 'Do you prefer practical effects over CGI?',
    });
  });

  it('accepts string confidence values from model output', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        statusCode: 200,
        info: { imdbId: 'tt0133093', title: 'The Matrix', year: '1999' },
      }),
    );
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        provider: 'openai',
        output_text: JSON.stringify({
          decision_type: 'SPEAK',
          confidence: '0.58',
          review_text: longReviewText,
        }),
      }),
    );

    const result = await service.generateReview(validInput, context);
    expect(result.statusCode).toBe(200);
    expect(result.errors).toEqual([]);
    expect(result.data).toEqual({
      decisionType: 'SPEAK',
      confidence: 0.58,
      reviewText: longReviewText,
    });
  });

  it('forwards x-trace-id and Authorization to llmRouter', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        statusCode: 200,
        info: { imdbId: 'tt0133093', title: 'The Matrix', year: '1999' },
      }),
    );
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        provider: 'openai',
        output_text: JSON.stringify({
          decision_type: 'SPEAK',
          confidence: 0.91,
          review_text: longReviewText,
        }),
      }),
    );

    const result = await service.generateReview(validInput, context);
    expect(result.statusCode).toBe(200);

    const secondCall = fetchMock.mock.calls[1];
    expect(secondCall[0]).toBe('http://localhost:3000/api/justus/llmRouter');
    expect(secondCall[1].headers['x-trace-id']).toBe('trace-abc-123');
    expect(secondCall[1].headers.Authorization).toBe('Bearer test-token');
  });

  it('sends different prompt policies for spoiler vs non-spoiler mode', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        statusCode: 200,
        info: { imdbId: 'tt0133093', title: 'The Matrix', year: '1999' },
      }),
    );
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        provider: 'openai',
        output_text: JSON.stringify({
          decision_type: 'ASK_LIGHT_QUESTION',
          confidence: 0.64,
          light_question: 'Do you prefer social strategy over spectacle?',
        }),
      }),
    );
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        statusCode: 200,
        info: { imdbId: 'tt0133093', title: 'The Matrix', year: '1999' },
      }),
    );
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        provider: 'openai',
        output_text: JSON.stringify({
          decision_type: 'ASK_LIGHT_QUESTION',
          confidence: 0.64,
          light_question: 'Do you prefer social strategy over spectacle?',
        }),
      }),
    );

    await service.generateReview(
      { ...validInput, spoilerMode: 'spoiler', forceRefresh: true },
      context,
    );
    await service.generateReview(
      { ...validInput, spoilerMode: 'non-spoiler', forceRefresh: true },
      context,
    );

    const spoilerBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    const nonSpoilerBody = JSON.parse(fetchMock.mock.calls[3][1].body);

    expect(spoilerBody.input).toContain('REVIEW_MODE: spoiler');
    expect(spoilerBody.system).toContain('MODE POLICY: spoiler');
    expect(nonSpoilerBody.input).toContain('REVIEW_MODE: non-spoiler');
    expect(nonSpoilerBody.system).toContain('MODE POLICY: non-spoiler');
  });
});
