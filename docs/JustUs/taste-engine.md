# Implement: NestJS “Generate Review Engine” Endpoint

### 1) Endpoint contract

**Route (recommended):**

- `POST /api/justus/generateReview`
    

**Auth / trace / envelope:**

- Bearer token guard (same pattern)
    
- Accept `x-trace-id`; always return it
    
- Standard response envelope `{ statusCode, errors, latency, data, traceId }`
    

### 2) Inputs (from generate-review-diagram)

Minimum required inputs to match the mobile flow:

- `titleId: string` (imdbId)
    
- `spoilerMode: 'spoiler' | 'non-spoiler'`
    
- `forceRefresh?: boolean` (default false)
    
- `provider?: 'openai' | 'deepseek'` (optional)
    

These correspond to the diagram path where `generateReviewForTitle(args)` takes `titleId`, `spoilerMode`, and considers `forceRefresh` + provider.

**DTO example (shape, not code):**

- Validate `titleId` non-empty
    
- Validate spoilerMode enum
    
- Validate forceRefresh boolean
    
- Validate provider enum
    

### 3) Outputs

Return the server version of `ReviewResult` (same semantics as mobile):

- `decisionType: 'SPEAK' | 'SILENCE' | 'EXPLAIN_CONFLICT' | 'ASK_LIGHT_QUESTION'`
    
- `confidence: number`
    
- One of:
    
    - `reviewText`
        
    - `silenceReason`
        
    - `conflictExplanation`
        
    - `lightQuestion`
        
- `anchorsUsed`, `mismatches`, `structuralMatch` (if present)
    

### 4) Core algorithm (must match the diagram)

Implement exactly this flow:

1. **Load reviewGate (per user)**
    
    - Mobile loads from AsyncStorage
        
    - Server needs an equivalent: from DB keyed by user identity (or if user identity doesn’t exist yet, a single global gate config).
        
2. **Build TasteEvidence**
    
    - The evidence builder pulls title + taste snapshot + gate status + anchors + ratings + contradictions + drift + interactions
        
3. **Gate check**
    
    - If `evidence.gate.canSpeak === false`:
        
        - Create SILENCE result with `confidence=0` and `reason=gate.reason`
            
        - Persist it (generated_reviews)
            
        - Return it
            
4. **Cache check**
    
    - If `forceRefresh === false`:
        
        - If cached review exists AND decision != SILENCE, return cached
            
5. **LLM call**
    
    - Build `system` + `input` (Taste Engine prompt)
        
    - Call LLM Router (next section)
        
6. **Parse & validate model JSON**
    
    - Must enforce decision enum and required fields (mobile is strict about decision_type validity)
        
    - Strip code fences if present (mobile does)
        
7. **Persist generated result**
    
    - Save to generated_reviews
        
    - Return ReviewResult
        

---

## 5) LLM Router integration (hard requirement)

> POST: `/api/justus/llmRouter`

### Router payload shape (keep it identical)

Request to send:

- `provider` (optional)
    
- `input` (string, required)
    
- `system` (optional string)
    
- `metadata` (object)
    

### Headers to forward

If calling another local endpoint, forward:

- `Authorization`
    
- `x-trace-id`
    

## 6) NestJS module structure (per your template)

Create feature folder:

```
src/generate-review/
  generate-review.module.ts
  generate-review.controller.ts
  generate-review.service.ts
  dto/
    generate-review.dto.ts
```

Controller rules:

- `@Controller('api/justus')` + `@Post('generateReview')` (recommended)
    
- `@UseGuards(BearerTokenGuard)`
    
- Don’t use `@Res()` unless streaming/binary
    
- Always return envelope with `statusCode/errors/latency/data`
    

---

## 7) Persistence & idempotency

**Tables/collections implied by the diagram:**

- `generated_reviews` (store review results) > not applicable to API endpoint
    
- “feed cache” (no server-side cache) > not applicable to API endpoint
    

no server-side cache

---

## 8) Error handling (don’t leak internals)

Follow the API template rule: never throw raw errors to clients; return `errors[]` in envelope.

Recommended mapping:

- 400: validation / missing titleId / bad spoilerMode
    
- 404: title not found
    
- 502: llmRouter failed / invalid model output
    
- 500: unexpected
    

Always include traceId.

---

## 9) Test checklist (minimum)

1. **Gate false** returns SILENCE and persists it
    
2. **Gate true** calls llmRouter and parses decision_type strictly
    
3. **Model returns fenced JSON** still parses (strip fences)
    
4. **Trace forwarding**: engine ➜ router keeps `x-trace-id`
    

---

## 10) Mobile changes (what gets deleted / replaced)

Stop calling `reviewService.generateReviewForTitle(...)` locally and instead:

- call `POST /api/justus/generateReview`
    
- use returned ReviewResult to update item state (expandedReview, hasGeneratedReview, etc.)—same state transitions as now.
    

Keep the UI behavior (spoiler mode selection, expanded pending state). The engine move is purely backend.

---

The following fields need to be passed into ``POST /api/justus/generateReview`` for the taste engine and the AI to generate an accurate review:

- title context (at minimum title_id; ideally full metadata: title, year, genre, plot, runtime, etc.)
- spoiler_mode (non-spoiler or spoiler)
- contradictions (unresolved count + examples)
- drift signals
- interactions aggregates (views/skips/saves/likes/listAdds/totalReviewInteractions)
- want_to_watch_rationale (optional but improves explanation quality)

So the practical required set is:

- user_ratings
- taste_anchors
- taste_snapshot
- gate_state
- title (or title_id + server-side title lookup)
- spoiler_mode
- contradictions
- drift
- interactions
- want_to_watch_rationale (recommended)

If your backend can derive some of these from DB using title_id + authenticated user, then mobile can send less. But for accurate generation, the model input should include all of the above evidence fields.

---
	
## Postman example: `POST /api/justus/generateReview`

```

**Headers**

- `Authorization: Bearer API_BEARER_TOKEN`
    
- `Content-Type: application/json`
    
- `x-trace-id: test-review-002`
    

**Body (raw JSON)**

```json
{
  "spoiler_mode": "non-spoiler",

  "title": {
    "title_id": "tt3118452",
    "title": "The Circle",
    "year": 2017,
    "genres": ["Reality TV", "Competition"],
    "plot": "Contestants live in isolation and communicate through a social media platform to win a cash prize.",
    "runtime_minutes": 97
  },

  "gate_state": {
    "can_speak": true,
    "reason": null,
    "updated_at": "2026-02-17T08:00:00.000Z"
  },

  "taste_snapshot": {
    "version": "v1",
    "signals": {
      "preferred_tones": ["psychological", "social-strategy"],
      "pace_preference": "medium",
      "violence_tolerance": "low",
      "humor_tolerance": "medium"
    },
    "summary": "Tends to like social-strategy and psychological tension; dislikes mean-spirited humiliation."
  },

  "taste_anchors": [
    {
      "anchor_id": "a_social-strategy",
      "label": "social strategy / persuasion games",
      "weight": 0.82,
      "evidence": ["liked: The Circle (concept)", "saved: similar social games"]
    },
    {
      "anchor_id": "a_psych-pressure",
      "label": "psychological pressure in competitions",
      "weight": 0.71,
      "evidence": ["high watch-through on pressure-cooker reality"]
    }
  ],

  "user_ratings": [
    {
      "title_id": "tt2267998",
      "rating": 4.5,
      "rated_at": "2025-11-03T10:00:00.000Z"
    },
    {
      "title_id": "tt3118452",
      "rating": 3.5,
      "rated_at": "2026-02-01T10:00:00.000Z"
    }
  ],

  "contradictions": {
    "unresolved_count": 1,
    "examples": [
      {
        "type": "tone_mismatch",
        "expected": "clever-social-strategy",
        "observed": "cringe-awkwardness",
        "note": "Sometimes skips second-hand embarrassment content."
      }
    ]
  },

  "drift": {
    "trend": "shifting_toward_documentary",
    "confidence": 0.58,
    "signals": [
      { "signal": "recent_likes_more_serious", "weight": 0.6 },
      { "signal": "recent_skips_reality_drama", "weight": 0.4 }
    ]
  },

  "interactions": {
    "views": 14,
    "skips": 3,
    "saves": 6,
    "likes": 9,
    "listAdds": 2,
    "totalReviewInteractions": 5
  },

  "want_to_watch_rationale": "Interested in persuasion games, but avoiding anything too mean-spirited or humiliation-based.",

  "force_refresh": false,
  "provider": "openai"
}
```

---

## What the API should do with this bundle (non-negotiable validation)

If the client is sending taste state, the server must treat it like **untrusted input**:

- `spoiler_mode`: enum only (`spoiler` | `non-spoiler`)
    
- `title`: must contain `title_id`; if `title` object missing, allow `title_id` and do server-side lookup
    
- `gate_state.can_speak`: boolean required (or server overrides if it owns gate)
    
- `taste_snapshot.version`: required (so prompt+parsing stays stable)
    
- `taste_anchors`: cap size (ex: max 50)
    
- `user_ratings`: cap size (ex: max 500) and/or require it be **recent window**
    
- `contradictions.unresolved_count`: must equal `examples.length` or be consistent
    
- `interactions.totalReviewInteractions`: compute or verify (don’t trust)
    
	
---

## If the goal is “accurate review” without shipping everything

Best compromise (usually): client sends **only**:

- `title_id`, `spoiler_mode`, `want_to_watch_rationale`, `interactions` aggregates
    

Server loads the rest by `userId` from token. That’s smaller, harder to spoof, and keeps taste evolution consistent.