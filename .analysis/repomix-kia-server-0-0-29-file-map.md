This file is a merged representation of the entire codebase, combined into a single document by Repomix.
The content has been processed where content has been compressed (code blocks are separated by ⋮---- delimiter).

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Content has been compressed - code blocks are separated by ⋮---- delimiter
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.analysis/
  repomix-kia-server-0-0-29-metadata-only.md
docs/
  parse.md
  sop-setup.md
  taste-engine.md
  tmpl-api-pattern.md
postman/
  Railway_aSunder.postman_collection.json
  Railway_JustUs.postman_collection.json
  Railway_Kiaspora.postman_collection.json
  Railway_Parse.postman_collection.json
  Railway_Server.postman_collection.json
public/
  calendarItems.json
  trailer_ids.json
  trailers_list.json
src/
  asunder/
    asunder.module.ts
    attachment.util.ts
    llmBridge.controller.spec.ts
    llmBridge.controller.ts
    llmBridge.service.spec.ts
    llmBridge.service.ts
  auth/
    bearer-token.guard.ts
  common/
    trace-id.interceptor.ts
    trace-id.middleware.ts
  generate-review/
    dto/
      generate-review.dto.spec.ts
      generate-review.dto.ts
    generate-review.controller.ts
    generate-review.module.ts
    generate-review.service.spec.ts
    generate-review.service.ts
  justus/
    filmTrailer.controller.ts
    filmTrailer.service.ts
    justus.module.ts
    llmRouter.controller.ts
    llmRouter.service.ts
    titleDetail.controller.ts
    titleSearch.controller.ts
    trailers.controller.ts
  kiaspora/
    ffmpeg.ts
    googleSpeechToText.ts
    imageScan.controller.ts
    imageScan.module.ts
    imageScan.service.ts
    kiaspora.module.ts
    promptConfig.controller.ts
    promptConfig.module.ts
    promptConfig.service.ts
    speechToText.controller.ts
    speechToText.module.ts
    speechToText.service.ts
    translationChat.controller.ts
    translationChat.module.ts
    translationChat.service.ts
    translationRouter.controller.ts
    translationRouter.service.ts
  meta/
    meta.controller.spec.ts
    meta.controller.ts
  parse/
    imdb-detail.controller.ts
    imdb-search.controller.ts
    parse.controller.ts
  app.controller.spec.ts
  app.controller.ts
  app.module.ts
  app.service.ts
  main.ts
test/
  app.e2e-spec.ts
  jest-e2e.json
.gitignore
.prettierrc
AGENTS.md
app.module.ts
eslint.config.mjs
Makefile
nest-cli.json
package.json
README.md
tsconfig.build.json
tsconfig.json
```

# Files

## File: .analysis/repomix-kia-server-0-0-29-metadata-only.md
`````markdown
This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
docs/
  parse.md
  sop-setup.md
  taste-engine.md
  tmpl-api-pattern.md
postman/
  Railway_aSunder.postman_collection.json
  Railway_JustUs.postman_collection.json
  Railway_Kiaspora.postman_collection.json
  Railway_Parse.postman_collection.json
  Railway_Server.postman_collection.json
public/
  calendarItems.json
  trailer_ids.json
  trailers_list.json
src/
  asunder/
    asunder.module.ts
    attachment.util.ts
    llmBridge.controller.spec.ts
    llmBridge.controller.ts
    llmBridge.service.spec.ts
    llmBridge.service.ts
  auth/
    bearer-token.guard.ts
  common/
    trace-id.interceptor.ts
    trace-id.middleware.ts
  generate-review/
    dto/
      generate-review.dto.spec.ts
      generate-review.dto.ts
    generate-review.controller.ts
    generate-review.module.ts
    generate-review.service.spec.ts
    generate-review.service.ts
  justus/
    filmTrailer.controller.ts
    filmTrailer.service.ts
    justus.module.ts
    llmRouter.controller.ts
    llmRouter.service.ts
    titleDetail.controller.ts
    titleSearch.controller.ts
    trailers.controller.ts
  kiaspora/
    ffmpeg.ts
    googleSpeechToText.ts
    imageScan.controller.ts
    imageScan.module.ts
    imageScan.service.ts
    kiaspora.module.ts
    promptConfig.controller.ts
    promptConfig.module.ts
    promptConfig.service.ts
    speechToText.controller.ts
    speechToText.module.ts
    speechToText.service.ts
    translationChat.controller.ts
    translationChat.module.ts
    translationChat.service.ts
    translationRouter.controller.ts
    translationRouter.service.ts
  meta/
    meta.controller.spec.ts
    meta.controller.ts
  parse/
    imdb-detail.controller.ts
    imdb-search.controller.ts
    parse.controller.ts
  app.controller.spec.ts
  app.controller.ts
  app.module.ts
  app.service.ts
  main.ts
test/
  app.e2e-spec.ts
  jest-e2e.json
.gitignore
.prettierrc
AGENTS.md
app.module.ts
eslint.config.mjs
Makefile
nest-cli.json
package.json
README.md
tsconfig.build.json
tsconfig.json
```
`````

## File: docs/parse.md
`````markdown
## Clean one-liner (single object array)

```bash
rg -oP 'href="/title/\Ktt[0-9]+' trailers.html \
| sort -u \
| jq -R . \
| jq -s 'map({imdb_id: .})' \
> trailers.json
```

---

### What this does

1. Extract only `tt1234567`
2. `sort -u` → remove duplicates
3. `jq -R .` → convert each line to JSON string
4. `jq -s` → wrap into array and map to:

   ```json
   { "imdb_id": "ttXXXXXXX" }
   ```

---

## Result

```json
[
  { "imdb_id": "tt36915004" },
  { "imdb_id": "tt6113186" },
  { "imdb_id": "tt32237111" }
]
```

Saved to:

```bash
trailers.json
```
`````

## File: docs/sop-setup.md
`````markdown
# NestJS API – End-to-End SOP

Scope:

- Create NestJS server
    
- Implement `/status` and `/about`
    
- Run locally with **pnpm**
    
- Deploy to **Railway via GitHub `main` branch**
    
- Re-implement cleanly from scratch if needed
    

No guesswork. Follow steps in order.

---

# 0. Prerequisites

Install:

- Node.js LTS (≥ 20)
    
- Git
    
- GitHub account
    
- Railway account (GitHub connected)
    

Verify:

```bash
node -v
git --version
```

---

# 1. Enable pnpm (via Corepack)

Node 20 ships with Corepack.

```bash
corepack enable
pnpm -v
```

If that prints a version → ready.

---

# 2. Create NestJS App

```bash
pnpm dlx @nestjs/cli new api
```

Select:

```
pnpm
```

Then:

```bash
cd api
```

---

# 3. Implement Endpoints

## 3.1 Generate controller

```bash
pnpm nest g controller meta
```

---

## 3.2 Replace `src/meta/meta.controller.ts`

```ts
import { Controller, Get } from '@nestjs/common';

@Controller()
export class MetaController {

  @Get('status')
  status() {
    return {
      ok: true,
      service: 'api',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('about')
  about() {
    return {
      name: 'api',
      description: 'NestJS service deployed on Railway',
      version: process.env.npm_package_version ?? '0.0.0',
    };
  }
}
```

---

## 3.3 Register controller

Edit `src/app.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { MetaController } from './meta/meta.controller';

@Module({
  imports: [],
  controllers: [MetaController],
  providers: [],
})
export class AppModule {}
```

---

# 4. Make Server Railway-Compatible

Railway injects a `PORT`.  
Never hardcode `3000`.

Edit `src/main.ts`:

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = parseInt(process.env.PORT ?? '3000', 10);

  await app.listen(port);
}
bootstrap();
```

---

# 5. Local Development

## 5.1 Install dependencies

```bash
pnpm install
```

If warning about ignored build scripts appears:

Ignore unless build fails.

---

## 5.2 Development mode

```bash
pnpm run start:dev
```

Visit:

```
http://localhost:3000/status
http://localhost:3000/about
```

Expected JSON responses.

---

## 5.3 Production build test (important before deploy)

```bash
pnpm run build
pnpm run start:prod
```

Test again:

```bash
curl http://localhost:3000/status
```

If production build works locally → deployment will work.

---

# 6. GitHub Setup

From project root:

```bash
git init
git add .
git commit -m "Initial NestJS API with status/about"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

Confirm:

- `main` branch exists
    
- Code visible in GitHub
    

---

# 7. Railway Deployment

## 7.1 Create Project

1. Log into Railway
    
2. New Project
    
3. Deploy from GitHub repo
    
4. Select repo
    
5. Select branch: `main`
    

---

## 7.2 Set Build & Start Commands (IMPORTANT)

Go to Service → Settings → Deploy

Set:

**Build Command**

```
pnpm install && pnpm run build
```

**Start Command**

```
pnpm run start:prod
```

---

## 7.3 Confirm PORT Binding

Railway auto-sets `PORT`.

No need to configure manually.

---

# 8. Deploy Flow

Deployment happens automatically when:

- Push to `main`
    
- Merge PR into `main`
    

To test:

```bash
git commit --allow-empty -m "Trigger deploy"
git push
```

Watch Railway logs.

---

# 9. Verify Production

Railway provides a public domain:

```
https://your-service.up.railway.app
```

Test:

```
/status
/about
```

Must return valid JSON.

---

# 10. Full Re-Implementation Checklist

If starting fresh or onboarding a new dev:

### Clean Rebuild Procedure

1. Install Node LTS
    
2. Enable corepack
    
3. `pnpm dlx @nestjs/cli new api`
    
4. Implement controller
    
5. Modify `main.ts`
    
6. Run `pnpm run build`
    
7. Test endpoints locally
    
8. Push to GitHub `main`
    
9. Connect Railway
    
10. Set build/start commands
    
11. Verify deployment URL
    

If all steps succeed → re-implementation complete.

---

# 11. Common Failures + Fixes

## App not accessible on Railway

Cause:  
Hardcoded port.

Fix:  
Ensure `process.env.PORT` used in `main.ts`.

---

## “No start command found”

Cause:  
Railway not detecting script.

Fix:  
Manually set:

```
pnpm run start:prod
```

---

## Build fails locally

Run:

```bash
pnpm approve-builds
pnpm install
```

Only if necessary.

---

# 12. Minimal Production Hardening (Recommended Next)

After baseline works:

- Enable CORS
    
- Add global validation pipe
    
- Add `/healthz`
    
- Add request logging
    
- Add `.env` support via `@nestjs/config`
    
- Add e2e test hitting `/status`
    

---

# Final Architecture Summary

Structure:

```
src/
  main.ts
  app.module.ts
  meta/
    meta.controller.ts
```

Endpoints:

```
GET /status
GET /about
```

Build:

```
pnpm run build
```

Start:

```
pnpm run start:prod
```

Deploy trigger:

```
Push to main
```

---

## Add Swagger (NestJS)

### 1) Install packages

```bash
pnpm add @nestjs/swagger swagger-ui-express
```

### 2) Update `src/main.ts`

Add Swagger setup before `listen()`:

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('NestJS API')
    .setVersion(process.env.npm_package_version ?? '0.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port);
}
bootstrap();
```

### 3) Add basic Swagger metadata to endpoints (optional but useful)

Edit `src/meta/meta.controller.ts`:

```ts
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('meta')
@Controller()
export class MetaController {
  @Get('status')
  @ApiOkResponse({
    schema: {
      example: { ok: true, service: 'api', timestamp: '2026-02-15T00:00:00.000Z' },
    },
  })
  status() {
    return { ok: true, service: 'api', timestamp: new Date().toISOString() };
  }

  @Get('about')
  @ApiOkResponse({
    schema: {
      example: { name: 'api', description: 'NestJS service deployed on Railway', version: '0.0.0' },
    },
  })
  about() {
    return {
      name: 'api',
      description: 'NestJS service deployed on Railway',
      version: process.env.npm_package_version ?? '0.0.0',
    };
  }
}
```

### 4) Run + verify

```bash
pnpm run start:dev
```

Open:

- `http://localhost:3000/docs` (Swagger UI)
    
- `http://localhost:3000/docs-json` (OpenAPI JSON)
    

### 5) Deploy

Commit + push to `main`. Railway redeploys. Swagger will be at:

- `https://<railway-domain>/docs`
    

If Swagger UI is publicly exposed and that’s not desired, say so—can lock it down by environment or basic auth.
`````

## File: docs/taste-engine.md
`````markdown
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
`````

## File: docs/tmpl-api-pattern.md
`````markdown
# TEMPLATE.md

```md
# NestJS API Template (Bearer-secured + Trace-ID + JSON Envelope)

## Contract (all endpoints)
- Path prefix: `/api/...`
- Security: `Bearer <token>` required (verified by `BearerTokenGuard`)
- Trace: every request/response has a UUID `traceId`
  - Incoming accepted via `x-trace-id` (or generated)
  - Always returned in header `x-trace-id` and in JSON body `traceId` (global interceptor)
- Response shape (standard envelope):
  ```json
  {
    "statusCode": 200,
    "errors": [],
    "latency": 123,
    "size": 456,
    "data": {},
    "traceId": "uuid..."
  }
```

## 0) Prereqs

- `.env` must include:
    
    ```
    API_BEARER_TOKEN=replace_me
    ```
    
- App loads `.env` via `@nestjs/config`:
    
    - `ConfigModule.forRoot({ isGlobal: true })`
        

## 1) Platform layer (DO ONCE)

### A) Auth Guard

File: `src/auth/bearer-token.guard.ts`

- Reads `process.env.API_BEARER_TOKEN`
    
- Rejects missing/invalid `Authorization: Bearer ...`
    

### B) Trace-ID

Files:

- `src/common/trace-id.middleware.ts`
    
- `src/common/trace-id.interceptor.ts`
    

Middleware:

- If request has `x-trace-id`, validate UUID; else generate UUID
    
- Attach to `req.traceId`
    
- Set response header `x-trace-id`
    

Interceptor:

- Inject `traceId` into JSON bodies
    
- If handler returns array/primitive, wrap:
    
    ```json
    { "traceId": "...", "data": [...] }
    ```
    

### C) AppModule wiring

- Apply middleware for `*`
    
- Register interceptor globally via `APP_INTERCEPTOR`
    
- Import feature modules in `AppModule`
    

### D) Validation (recommended)

In `main.ts`, add:

- `ValidationPipe({ whitelist: true, transform: true })`
    

## 2) Feature module pattern (FOR EVERY NEW API)

Folder layout:

```
src/<feature>/
  <feature>.module.ts
  <feature>.controller.ts
  <feature>.service.ts
  dto/
    <feature>.dto.ts
```

### Controller rules

- Put `@Controller('api/<feature>')`
    
- Put `@UseGuards(BearerTokenGuard)` at controller level
    
- Do NOT use `@Res()` unless streaming/binary
    
- Return standard envelope:
    
    - `statusCode`, `errors`, `latency`, `size?`, `data`
        
- Never throw raw errors to clients. Prefer envelope with `errors[]`.
    

### Internal calls

If calling another local endpoint:

- Forward `Authorization`
    
- Forward `x-trace-id`  
    Use helper: `forwardAuthAndTrace(req)`.
    

## 3) Copy/paste skeleton

### `<feature>.controller.ts` skeleton

```ts
@Controller('api/<feature>')
@UseGuards(BearerTokenGuard)
export class <Feature>Controller {
  constructor(private readonly svc: <Feature>Service) {}

  @Get()
  async handler(@Query() q: <Feature>QueryDto): Promise<ApiResponse<any>> {
    const started = Date.now();
    try {
      const data = await this.svc.run(q);
      return { statusCode: 200, errors: [], latency: Date.now() - started, data };
    } catch (e: any) {
      return { statusCode: 500, errors: [String(e?.message ?? e)], latency: Date.now() - started, data: null };
    }
  }
}
```

## 4) Postman defaults

- Authorization: Bearer Token = `{{API_BEARER_TOKEN}}`
    
- Optional header: `x-trace-id: {{$guid}}`
    

```

---

# Stub generator layout

## 1) Add these two folders

```

scripts/  
gen-api.ts  
templates/  
api-feature/  
feature.module.ts.tpl  
feature.controller.ts.tpl  
feature.service.ts.tpl  
dto/feature.dto.ts.tpl

````

---

## 2) Templates

### `templates/api-feature/feature.module.ts.tpl`
```ts
import { Module } from '@nestjs/common';
import { __FeaturePascal__Controller } from './__featureKebab__.controller';
import { __FeaturePascal__Service } from './__featureKebab__.service';

@Module({
  controllers: [__FeaturePascal__Controller],
  providers: [__FeaturePascal__Service],
  exports: [__FeaturePascal__Service],
})
export class __FeaturePascal__Module {}
````

### `templates/api-feature/feature.controller.ts.tpl`

```ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BearerTokenGuard } from '../auth/bearer-token.guard';
import { __FeaturePascal__Service } from './__featureKebab__.service';
import { __FeaturePascal__QueryDto } from './dto/__featureKebab__.dto';

type ApiResponse<T> = {
  statusCode: number;
  errors: string[];
  latency: number;
  size?: number;
  data: T;
  // traceId injected by interceptor
};

@Controller('api/__featureKebab__')
@UseGuards(BearerTokenGuard)
export class __FeaturePascal__Controller {
  constructor(private readonly svc: __FeaturePascal__Service) {}

  @Get()
  async handler(@Query() q: __FeaturePascal__QueryDto): Promise<ApiResponse<{ ok: true } | null>> {
    const started = Date.now();
    try {
      await this.svc.run(q);
      return {
        statusCode: 200,
        errors: [],
        latency: Date.now() - started,
        data: { ok: true },
      };
    } catch (e: any) {
      return {
        statusCode: 500,
        errors: [String(e?.message ?? e)],
        latency: Date.now() - started,
        data: null,
      };
    }
  }
}
```

### `templates/api-feature/feature.service.ts.tpl`

```ts
import { Injectable } from '@nestjs/common';
import { __FeaturePascal__QueryDto } from './dto/__featureKebab__.dto';

@Injectable()
export class __FeaturePascal__Service {
  async run(_q: __FeaturePascal__QueryDto): Promise<void> {
    // TODO: implement
  }
}
```

### `templates/api-feature/dto/feature.dto.ts.tpl`

```ts
import { IsOptional, IsString } from 'class-validator';

export class __FeaturePascal__QueryDto {
  @IsOptional()
  @IsString()
  q?: string;
}
```

---

## 3) Generator script

### `scripts/gen-api.ts`

```ts
#!/usr/bin/env ts-node

import fs from 'node:fs';
import path from 'node:path';

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

function toKebab(s: string) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function toPascal(s: string) {
  const clean = s.replace(/[-_]/g, ' ').trim();
  return clean
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');
}

function render(tpl: string, vars: Record<string, string>) {
  let out = tpl;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(k, v);
  }
  return out;
}

const rawName = process.argv[2];
if (!rawName) fail('Usage: pnpm gen:api <FeatureName>  (e.g. imdb-search or ImdbSearch)');

const featureKebab = toKebab(rawName);
const featurePascal = toPascal(rawName);

const repoRoot = process.cwd();
const templatesRoot = path.join(repoRoot, 'templates', 'api-feature');
const featureDir = path.join(repoRoot, 'src', featureKebab);

if (fs.existsSync(featureDir)) fail(`Feature already exists: ${featureDir}`);

fs.mkdirSync(path.join(featureDir, 'dto'), { recursive: true });

const vars = {
  '__featureKebab__': featureKebab,
  '__FeaturePascal__': featurePascal,
};

const files: Array<{ src: string; dst: string }> = [
  {
    src: path.join(templatesRoot, 'feature.module.ts.tpl'),
    dst: path.join(featureDir, `${featureKebab}.module.ts`),
  },
  {
    src: path.join(templatesRoot, 'feature.controller.ts.tpl'),
    dst: path.join(featureDir, `${featureKebab}.controller.ts`),
  },
  {
    src: path.join(templatesRoot, 'feature.service.ts.tpl'),
    dst: path.join(featureDir, `${featureKebab}.service.ts`),
  },
  {
    src: path.join(templatesRoot, 'dto', 'feature.dto.ts.tpl'),
    dst: path.join(featureDir, 'dto', `${featureKebab}.dto.ts`),
  },
];

for (const f of files) {
  const tpl = fs.readFileSync(f.src, 'utf8');
  fs.writeFileSync(f.dst, render(tpl, vars), 'utf8');
}

console.log(`Created feature: src/${featureKebab}/`);
console.log(`Next: import ${featurePascal}Module in AppModule.`);
```

---

## 4) Wire it into package scripts

In `package.json`:

```json
{
  "scripts": {
    "gen:api": "ts-node scripts/gen-api.ts"
  }
}
```

If `ts-node` isn’t installed:

```bash
pnpm add -D ts-node typescript
```

---

## 5) How future devs use it

```bash
pnpm gen:api imdb-search
# then add ImdbSearchModule to AppModule imports
```

---

If the current repo is still using “controllers registered in AppModule” instead of modules, keep the generator as-is and just add a “module import step” in the output message (already there). Once the repo migrates fully to feature modules, new APIs become totally mechanical.
`````

## File: postman/Railway_JustUs.postman_collection.json
`````json
{
  "info": {
    "_postman_id": "191cfd03-4fc7-4a29-8616-681fbe3171f7",
    "name": "Railway_JustUs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    "_exporter_id": "50448986",
    "_collection_link": "https://go.postman.co/collection/50448986-191cfd03-4fc7-4a29-8616-681fbe3171f7?source=collection_link"
  },
  "item": [
    {
      "name": "api/justus/filmTrailer",
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{API_BEARER_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/justus/filmTrailer?maxResults=10&q=one mile official movie trailer 2026",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "justus",
            "filmTrailer"
          ],
          "query": [
            {
              "key": "maxResults",
              "value": "10"
            },
            {
              "key": "q",
              "value": "one mile official movie trailer 2026"
            }
          ]
        }
      },
      "response": []
    },
    {
      "name": "/api/justus/llmRouter",
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{API_BEARER_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "POST",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"provider\": \"openai\",\n  \"input\": \"Get The unique IMDb ID for: Title: casablanca\",\n  \"system\": \"Act as a deterministic IMDb ID resolution engine. Given a title (required) and optionally a year and type, return the single correct IMDb tconst (e.g., tt0468569). Input Examples: 'Get the unique imdb id for: The Dark Knight 2008' or 'Get the unique imdb id for: Casablanca'. Core Rules: Always resolve to the canonical IMDb ID (tt + digits). If multiple results match: return list. Never fabricate an ID. Output must be JSON only. JSON output Example: [ { \\\"tconst\\\": \\\"tt0084994\\\", \\\"title\\\": \\\"Casablanca\\\", \\\"year\\\": 1983 }, { \\\"tconst\\\": \\\"tt0090801\\\", \\\"title\\\": \\\"Casablanca, Casablanca\\\", \\\"year\\\": 1985 s}]\",\n  \"metadata\": {}\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/justus/llmRouter",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "justus",
            "llmRouter"
          ]
        }
      },
      "response": []
    },
    {
      "name": "api/justus/titleDetail",
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{API_BEARER_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/justus/titleDetail?imdbId=tt24326458",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "justus",
            "titleDetail"
          ],
          "query": [
            {
              "key": "imdbId",
              "value": "tt24326458"
            }
          ]
        }
      },
      "response": []
    },
    {
      "name": "api/justus/titleSearch",
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{API_BEARER_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/justus/titleSearch?limit=10&query=casablanca 1942",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "justus",
            "titleSearch"
          ],
          "query": [
            {
              "key": "limit",
              "value": "10"
            },
            {
              "key": "query",
              "value": "casablanca 1942"
            }
          ]
        }
      },
      "response": []
    },
    {
      "name": "OMDB API",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://www.omdbapi.com/?apikey=1e26bd15&i=tt0034583",
          "protocol": "http",
          "host": [
            "www",
            "omdbapi",
            "com"
          ],
          "path": [
            ""
          ],
          "query": [
            {
              "key": "apikey",
              "value": "1e26bd15"
            },
            {
              "key": "i",
              "value": "tt0034583"
            }
          ]
        }
      },
      "response": []
    }
  ]
}
`````

## File: postman/Railway_Kiaspora.postman_collection.json
`````json
{
  "info": {
    "_postman_id": "a275a861-bccc-4ef1-9497-61f9432fdee9",
    "name": "Railway_Kiaspora",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    "_exporter_id": "50448986",
    "_collection_link": "https://go.postman.co/collection/50448986-a275a861-bccc-4ef1-9497-61f9432fdee9?source=collection_link"
  },
  "item": [
    {
      "name": "speechToText",
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{API_BEARER_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{TOKEN}}",
            "type": "text"
          }
        ],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "languageCode",
              "value": "zh-CN",
              "type": "text",
              "uuid": "ac8d4151-61bc-4831-9a8a-ff519e8d52a7"
            },
            {
              "key": "languageCodes",
              "value": "{{LANGUAGE_CODE}}",
              "type": "text"
            },
            {
              "key": "mimeType",
              "value": "{{MIME_TYPE}}",
              "type": "text"
            },
            {
              "key": "audio",
              "type": "file",
              "src": "/Users/novelbamboo/Documents/stt-audio/chinese/mandarin1_clip.3gp"
            },
            {
              "key": "audio",
              "type": "file",
              "uuid": "0a53789a-4e81-409f-92c1-a15bbb7498da",
              "src": "/Users/novelbamboo/Documents/stt-audio/addf8-Alaw-GW.3gp",
              "disabled": true
            }
          ]
        },
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/kiaspora/speechToText",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "kiaspora",
            "speechToText"
          ]
        }
      },
      "response": []
    },
    {
      "name": "translationChat",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "// Comprehensive tests for POST /api/imageScan endpoint",
              "",
              "// Test 1: Status code validation",
              "pm.test(\"Status code is 200 (Success)\", function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "// Test 2: Response body exists",
              "pm.test(\"Response body is not empty\", function () {",
              "    pm.expect(pm.response.text()).to.not.be.empty;",
              "});",
              "",
              "// Test 3: Response is valid JSON",
              "pm.test(\"Response is valid JSON\", function () {",
              "    pm.response.to.be.json;",
              "});",
              "",
              "// Test 4: Response body structure validation",
              "pm.test(\"Response has expected structure\", function () {",
              "    const jsonData = pm.response.json();",
              "    pm.expect(jsonData).to.be.an('object');",
              "});",
              "",
              "// Test 5: Check for success indicators",
              "pm.test(\"Response indicates successful processing\", function () {",
              "    const jsonData = pm.response.json();",
              "    // Check for common success patterns",
              "    const hasSuccessField = jsonData.success === true || jsonData.status === \"success\";",
              "    const hasData = jsonData.text || jsonData.extractedText || jsonData.data || jsonData.result;",
              "    pm.expect(hasSuccessField || hasData).to.be.true;",
              "});",
              "",
              "// Test 6: Extracted text validation",
              "pm.test(\"Response contains extracted text data\", function () {",
              "    const jsonData = pm.response.json();",
              "    const textField = jsonData.text || jsonData.extractedText || jsonData.data || jsonData.result;",
              "    pm.expect(textField).to.exist;",
              "});",
              "",
              "// Test 7: Extracted text is not empty (if present)",
              "pm.test(\"Extracted text is not empty string\", function () {",
              "    const jsonData = pm.response.json();",
              "    const textField = jsonData.text || jsonData.extractedText || jsonData.data || jsonData.result;",
              "    if (textField !== undefined) {",
              "        pm.expect(textField).to.not.equal(\"\");",
              "    }",
              "});",
              "",
              "// Test 8: Response time validation",
              "pm.test(\"Image scan completes in reasonable time (under 10 seconds)\", function () {",
              "    pm.expect(pm.response.responseTime).to.be.below(10000);",
              "});",
              "",
              "// Error Handling Tests",
              "",
              "// Test 9: Handle 400 Bad Request errors",
              "if (pm.response.code === 400) {",
              "    pm.test(\"Bad Request (400) includes error message\", function () {",
              "        const jsonData = pm.response.json();",
              "        pm.expect(jsonData.error || jsonData.message).to.exist;",
              "    });",
              "}",
              "",
              "// Test 10: Handle 401 Unauthorized errors",
              "if (pm.response.code === 401) {",
              "    pm.test(\"Unauthorized (401) includes authentication error\", function () {",
              "        const jsonData = pm.response.json();",
              "        pm.expect(jsonData.error || jsonData.message).to.exist;",
              "    });",
              "}",
              "",
              "// Test 11: Handle 413 Payload Too Large errors",
              "if (pm.response.code === 413) {",
              "    pm.test(\"Payload Too Large (413) indicates file size issue\", function () {",
              "        const jsonData = pm.response.json();",
              "        pm.expect(jsonData.error || jsonData.message).to.exist;",
              "    });",
              "}",
              "",
              "// Test 12: Handle 415 Unsupported Media Type errors",
              "if (pm.response.code === 415) {",
              "    pm.test(\"Unsupported Media Type (415) indicates format issue\", function () {",
              "        const jsonData = pm.response.json();",
              "        pm.expect(jsonData.error || jsonData.message).to.exist;",
              "    });",
              "}",
              "",
              "// Test 13: Handle 500 Internal Server Error",
              "if (pm.response.code === 500) {",
              "    pm.test(\"Internal Server Error (500) includes error details\", function () {",
              "        const jsonData = pm.response.json();",
              "        pm.expect(jsonData.error || jsonData.message).to.exist;",
              "    });",
              "}",
              "",
              "// Content Validation Tests",
              "",
              "// Test 14: Check response schema consistency",
              "pm.test(\"Response follows consistent schema\", function () {",
              "    const jsonData = pm.response.json();",
              "    const hasStandardFields = (",
              "        (jsonData.hasOwnProperty('success') || jsonData.hasOwnProperty('status')) &&",
              "        (jsonData.hasOwnProperty('text') || jsonData.hasOwnProperty('extractedText') || ",
              "         jsonData.hasOwnProperty('data') || jsonData.hasOwnProperty('error'))",
              "    );",
              "    pm.expect(hasStandardFields).to.be.true;",
              "});",
              "",
              "// Test 15: Validate text content type",
              "pm.test(\"Extracted text is string type\", function () {",
              "    const jsonData = pm.response.json();",
              "    const textField = jsonData.text || jsonData.extractedText || jsonData.data || jsonData.result;",
              "    if (textField !== undefined && textField !== null) {",
              "        pm.expect(textField).to.be.a('string');",
              "    }",
              "});",
              "",
              "// Test 16: Check for metadata (if applicable)",
              "pm.test(\"Response may include metadata\", function () {",
              "    const jsonData = pm.response.json();",
              "    // This is a soft check - metadata is optional",
              "    if (jsonData.metadata || jsonData.confidence || jsonData.language) {",
              "        pm.expect(jsonData.metadata || jsonData.confidence || jsonData.language).to.exist;",
              "    }",
              "});",
              "",
              "// Test 17: Validate no unexpected null values in success response",
              "if (pm.response.code === 200) {",
              "    pm.test(\"Success response has no critical null values\", function () {",
              "        const jsonData = pm.response.json();",
              "        const textField = jsonData.text || jsonData.extractedText || jsonData.data || jsonData.result;",
              "        pm.expect(textField).to.not.be.null;",
              "    });",
              "}"
            ],
            "type": "text/javascript",
            "packages": {},
            "requests": {}
          }
        }
      ],
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{API_BEARER_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Accept",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n    \"aiProvider\": \"groq\",\n    \"messages\": [\n    { \"role\": \"user\", \"content\": \"Hi\" },\n    { \"role\": \"system\", \"content\": \"你好 means hello; it's the standard Chinese greeting you use when meeting someone, including in a restaurant to greet the staff. For more politeness, use 您好; to greet more than one person, say 你们好.\\n\\nExample: Hello, may I see the menu, please?\\nExample: Hello, what do you recommend today?\" },\n    { \"role\": \"user\", \"content\": \"give me a sentance.\" }\n    ],\n    \"sourceLang\": \"zh\",\n    \"targetLang\": \"en\",\n    \"context\": \"menu, food\",\n    \"traceId\": \"postman-12345\",\n    \"customPrompt\": \"You are my friend from abroad. You are relatable and kind, sourceLang language tutor. I'm a targetLang speaker. 1. Response must be short, so I can keep up, less than 150 words. 2. Restrict all conversation to sourceLang-targetLang tutoring (address no questions outside this scope). 3. Always provide sourcePronunciation, as Pinyin, for sourceLang words.\"\n}\n",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/kiaspora/translationChat",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "kiaspora",
            "translationChat"
          ]
        }
      },
      "response": []
    },
    {
      "name": "translationRouter",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status is 200', function () {",
              "  pm.response.to.have.status(200);",
              "});",
              "",
              "const data = pm.response.json();",
              "",
              "pm.test('Has translation string', function () {",
              "  pm.expect(data).to.have.property('translation');",
              "  pm.expect(data.translation).to.be.a('string');",
              "});",
              "",
              "pm.test('Has detected_source_lang', function () {",
              "  pm.expect(data).to.have.property('detected_source_lang');",
              "});",
              "",
              "pm.test('Has provider identifier', function () {",
              "  pm.expect(data).to.have.property('provider');",
              "  pm.expect(['deepseek', 'openai']).to.include(data.provider);",
              "});",
              "",
              "pm.test('Has latency_ms number', function () {",
              "  pm.expect(data).to.have.property('latency_ms');",
              "  pm.expect(data.latency_ms).to.be.a('number');",
              "});",
              "",
              "// Store last translation for quick reuse in other requests",
              "pm.collectionVariables.set('lastTranslation', data.translation);",
              "pm.collectionVariables.set('lastProvider', data.provider);"
            ],
            "type": "text/javascript",
            "packages": {},
            "requests": {}
          }
        }
      ],
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{API_BEARER_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Accept",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"provider\": \"groq\",\n  \"sourceText\": \"你好\",\n  \"sourceLang\": \"zh\",\n  \"targetLang\": \"en\",\n  \"userMessage\": \"what tone is used for ni hao?\",\n  \"context\": \"learning, education, tutor\",\n  \"traceId\": \"postman-uuid-123\",\n  \"customPrompt\": \"Always respond with a single JSON object with the keys: 'sourceText', 'translatedText', 'sourcePronunciation'. Return JSON ONLY: no markdown, no code fences, no XML/HTML tags, and no extra commentary. Do NOT include any reasoning or hidden-thought text (for example, do not output <think>...</think>).\"\n}"
        },
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/kiaspora/translationRouter",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "kiaspora",
            "translationRouter"
          ]
        }
      },
      "response": []
    },
    {
      "name": "translationRouter [flow]",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status is 200', function () {",
              "  pm.response.to.have.status(200);",
              "});",
              "",
              "const data = pm.response.json();",
              "",
              "pm.test('Has translation string', function () {",
              "  pm.expect(data).to.have.property('translation');",
              "  pm.expect(data.translation).to.be.a('string');",
              "});",
              "",
              "pm.test('Has detected_source_lang', function () {",
              "  pm.expect(data).to.have.property('detected_source_lang');",
              "});",
              "",
              "pm.test('Has provider identifier', function () {",
              "  pm.expect(data).to.have.property('provider');",
              "  pm.expect(['deepseek', 'openai']).to.include(data.provider);",
              "});",
              "",
              "pm.test('Has latency_ms number', function () {",
              "  pm.expect(data).to.have.property('latency_ms');",
              "  pm.expect(data.latency_ms).to.be.a('number');",
              "});",
              "",
              "// Store last translation for quick reuse in other requests",
              "pm.collectionVariables.set('lastTranslation', data.translation);",
              "pm.collectionVariables.set('lastProvider', data.provider);"
            ],
            "type": "text/javascript",
            "packages": {},
            "requests": {}
          }
        }
      ],
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{API_BEARER_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Accept",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"provider\": \"deepseek\",\n  \"sourceText\": \"牛肉凉面 番茄鸡蛋面 羊肉泡馍 新疆拌面\",\n  \"sourceLang\": \"zh\",\n  \"targetLang\": \"en\",\n  \"context\": \"\",\n  \"traceId\": \"postman-uuid-123\",\n  \"customPrompt\": \"return a list [{translation, pronunciation, conversation }]. 1. Translate sourceText. 2. pronunciation (pinyin). conversation (order the dish in sourceLang)\"\n}"
        },
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/kiaspora/translationRouter",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "kiaspora",
            "translationRouter"
          ]
        }
      },
      "response": []
    },
    {
      "name": "imageScan [data]",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "// Comprehensive tests for POST /api/imageScan endpoint",
              "",
              "// Test 1: Status code validation",
              "pm.test(\"Status code is 200 (Success)\", function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "// Test 2: Response body exists",
              "pm.test(\"Response body is not empty\", function () {",
              "    pm.expect(pm.response.text()).to.not.be.empty;",
              "});",
              "",
              "// Test 3: Response is valid JSON",
              "pm.test(\"Response is valid JSON\", function () {",
              "    pm.response.to.be.json;",
              "});",
              "",
              "// Test 4: Response body structure validation",
              "pm.test(\"Response has expected structure\", function () {",
              "    const jsonData = pm.response.json();",
              "    pm.expect(jsonData).to.be.an('object');",
              "});",
              "",
              "// Test 5: Check for success indicators",
              "pm.test(\"Response indicates successful processing\", function () {",
              "    const jsonData = pm.response.json();",
              "    // Check for common success patterns",
              "    const hasSuccessField = jsonData.success === true || jsonData.status === \"success\";",
              "    const hasData = jsonData.text || jsonData.extractedText || jsonData.data || jsonData.result;",
              "    pm.expect(hasSuccessField || hasData).to.be.true;",
              "});",
              "",
              "// Test 6: Extracted text validation",
              "pm.test(\"Response contains extracted text data\", function () {",
              "    const jsonData = pm.response.json();",
              "    const textField = jsonData.text || jsonData.extractedText || jsonData.data || jsonData.result;",
              "    pm.expect(textField).to.exist;",
              "});",
              "",
              "// Test 7: Extracted text is not empty (if present)",
              "pm.test(\"Extracted text is not empty string\", function () {",
              "    const jsonData = pm.response.json();",
              "    const textField = jsonData.text || jsonData.extractedText || jsonData.data || jsonData.result;",
              "    if (textField !== undefined) {",
              "        pm.expect(textField).to.not.equal(\"\");",
              "    }",
              "});",
              "",
              "// Test 8: Response time validation",
              "pm.test(\"Image scan completes in reasonable time (under 10 seconds)\", function () {",
              "    pm.expect(pm.response.responseTime).to.be.below(10000);",
              "});",
              "",
              "// Error Handling Tests",
              "",
              "// Test 9: Handle 400 Bad Request errors",
              "if (pm.response.code === 400) {",
              "    pm.test(\"Bad Request (400) includes error message\", function () {",
              "        const jsonData = pm.response.json();",
              "        pm.expect(jsonData.error || jsonData.message).to.exist;",
              "    });",
              "}",
              "",
              "// Test 10: Handle 401 Unauthorized errors",
              "if (pm.response.code === 401) {",
              "    pm.test(\"Unauthorized (401) includes authentication error\", function () {",
              "        const jsonData = pm.response.json();",
              "        pm.expect(jsonData.error || jsonData.message).to.exist;",
              "    });",
              "}",
              "",
              "// Test 11: Handle 413 Payload Too Large errors",
              "if (pm.response.code === 413) {",
              "    pm.test(\"Payload Too Large (413) indicates file size issue\", function () {",
              "        const jsonData = pm.response.json();",
              "        pm.expect(jsonData.error || jsonData.message).to.exist;",
              "    });",
              "}",
              "",
              "// Test 12: Handle 415 Unsupported Media Type errors",
              "if (pm.response.code === 415) {",
              "    pm.test(\"Unsupported Media Type (415) indicates format issue\", function () {",
              "        const jsonData = pm.response.json();",
              "        pm.expect(jsonData.error || jsonData.message).to.exist;",
              "    });",
              "}",
              "",
              "// Test 13: Handle 500 Internal Server Error",
              "if (pm.response.code === 500) {",
              "    pm.test(\"Internal Server Error (500) includes error details\", function () {",
              "        const jsonData = pm.response.json();",
              "        pm.expect(jsonData.error || jsonData.message).to.exist;",
              "    });",
              "}",
              "",
              "// Content Validation Tests",
              "",
              "// Test 14: Check response schema consistency",
              "pm.test(\"Response follows consistent schema\", function () {",
              "    const jsonData = pm.response.json();",
              "    const hasStandardFields = (",
              "        (jsonData.hasOwnProperty('success') || jsonData.hasOwnProperty('status')) &&",
              "        (jsonData.hasOwnProperty('text') || jsonData.hasOwnProperty('extractedText') || ",
              "         jsonData.hasOwnProperty('data') || jsonData.hasOwnProperty('error'))",
              "    );",
              "    pm.expect(hasStandardFields).to.be.true;",
              "});",
              "",
              "// Test 15: Validate text content type",
              "pm.test(\"Extracted text is string type\", function () {",
              "    const jsonData = pm.response.json();",
              "    const textField = jsonData.text || jsonData.extractedText || jsonData.data || jsonData.result;",
              "    if (textField !== undefined && textField !== null) {",
              "        pm.expect(textField).to.be.a('string');",
              "    }",
              "});",
              "",
              "// Test 16: Check for metadata (if applicable)",
              "pm.test(\"Response may include metadata\", function () {",
              "    const jsonData = pm.response.json();",
              "    // This is a soft check - metadata is optional",
              "    if (jsonData.metadata || jsonData.confidence || jsonData.language) {",
              "        pm.expect(jsonData.metadata || jsonData.confidence || jsonData.language).to.exist;",
              "    }",
              "});",
              "",
              "// Test 17: Validate no unexpected null values in success response",
              "if (pm.response.code === 200) {",
              "    pm.test(\"Success response has no critical null values\", function () {",
              "        const jsonData = pm.response.json();",
              "        const textField = jsonData.text || jsonData.extractedText || jsonData.data || jsonData.result;",
              "        pm.expect(textField).to.not.be.null;",
              "    });",
              "}"
            ],
            "type": "text/javascript",
            "packages": {},
            "requests": {}
          }
        }
      ],
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{API_BEARER_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Accept",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "image",
              "description": "Binary file test for translation.",
              "type": "file",
              "uuid": "60be7478-268f-4dce-b7c2-c4a88395a9f2",
              "src": "/Users/novelbamboo/Downloads/sign.jpg"
            },
            {
              "key": "aiProvider",
              "value": "google",
              "type": "text",
              "uuid": "bb9c5ce7-e7d3-4246-806e-6b3e06df6ba9"
            },
            {
              "key": "customPrompt",
              "value": "",
              "description": "Extract all legible text from this ticket image. Preserve line breaks. Provide text translation & pronunciation",
              "type": "text",
              "uuid": "a510c456-b3f7-477a-942c-31a258b1b798"
            },
            {
              "key": "traceId",
              "value": "postman-form-data-uuid-123",
              "type": "text",
              "uuid": "75ff8d3f-2a78-4e66-8335-cfea68a7788e"
            }
          ]
        },
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/kiaspora/imageScan",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "kiaspora",
            "imageScan"
          ]
        }
      },
      "response": []
    },
    {
      "name": "imageScan [Base64]",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "// Comprehensive tests for POST /api/imageScan endpoint",
              "",
              "// Test 1: Status code validation",
              "pm.test(\"Status code is 200 (Success)\", function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "// Test 2: Response body exists",
              "pm.test(\"Response body is not empty\", function () {",
              "    pm.expect(pm.response.text()).to.not.be.empty;",
              "});",
              "",
              "// Test 3: Response is valid JSON",
              "pm.test(\"Response is valid JSON\", function () {",
              "    pm.response.to.be.json;",
              "});",
              "",
              "// Test 4: Response body structure validation",
              "pm.test(\"Response has expected structure\", function () {",
              "    const jsonData = pm.response.json();",
              "    pm.expect(jsonData).to.be.an('object');",
              "});",
              "",
              "// Test 5: Check for success indicators",
              "pm.test(\"Response indicates successful processing\", function () {",
              "    const jsonData = pm.response.json();",
              "    // Check for common success patterns",
              "    const hasSuccessField = jsonData.success === true || jsonData.status === \"success\";",
              "    const hasData = jsonData.text || jsonData.extractedText || jsonData.data || jsonData.result;",
              "    pm.expect(hasSuccessField || hasData).to.be.true;",
              "});",
              "",
              "// Test 6: Extracted text validation",
              "pm.test(\"Response contains extracted text data\", function () {",
              "    const jsonData = pm.response.json();",
              "    const textField = jsonData.text || jsonData.extractedText || jsonData.data || jsonData.result;",
              "    pm.expect(textField).to.exist;",
              "});",
              "",
              "// Test 7: Extracted text is not empty (if present)",
              "pm.test(\"Extracted text is not empty string\", function () {",
              "    const jsonData = pm.response.json();",
              "    const textField = jsonData.text || jsonData.extractedText || jsonData.data || jsonData.result;",
              "    if (textField !== undefined) {",
              "        pm.expect(textField).to.not.equal(\"\");",
              "    }",
              "});",
              "",
              "// Test 8: Response time validation",
              "pm.test(\"Image scan completes in reasonable time (under 10 seconds)\", function () {",
              "    pm.expect(pm.response.responseTime).to.be.below(10000);",
              "});",
              "",
              "// Error Handling Tests",
              "",
              "// Test 9: Handle 400 Bad Request errors",
              "if (pm.response.code === 400) {",
              "    pm.test(\"Bad Request (400) includes error message\", function () {",
              "        const jsonData = pm.response.json();",
              "        pm.expect(jsonData.error || jsonData.message).to.exist;",
              "    });",
              "}",
              "",
              "// Test 10: Handle 401 Unauthorized errors",
              "if (pm.response.code === 401) {",
              "    pm.test(\"Unauthorized (401) includes authentication error\", function () {",
              "        const jsonData = pm.response.json();",
              "        pm.expect(jsonData.error || jsonData.message).to.exist;",
              "    });",
              "}",
              "",
              "// Test 11: Handle 413 Payload Too Large errors",
              "if (pm.response.code === 413) {",
              "    pm.test(\"Payload Too Large (413) indicates file size issue\", function () {",
              "        const jsonData = pm.response.json();",
              "        pm.expect(jsonData.error || jsonData.message).to.exist;",
              "    });",
              "}",
              "",
              "// Test 12: Handle 415 Unsupported Media Type errors",
              "if (pm.response.code === 415) {",
              "    pm.test(\"Unsupported Media Type (415) indicates format issue\", function () {",
              "        const jsonData = pm.response.json();",
              "        pm.expect(jsonData.error || jsonData.message).to.exist;",
              "    });",
              "}",
              "",
              "// Test 13: Handle 500 Internal Server Error",
              "if (pm.response.code === 500) {",
              "    pm.test(\"Internal Server Error (500) includes error details\", function () {",
              "        const jsonData = pm.response.json();",
              "        pm.expect(jsonData.error || jsonData.message).to.exist;",
              "    });",
              "}",
              "",
              "// Content Validation Tests",
              "",
              "// Test 14: Check response schema consistency",
              "pm.test(\"Response follows consistent schema\", function () {",
              "    const jsonData = pm.response.json();",
              "    const hasStandardFields = (",
              "        (jsonData.hasOwnProperty('success') || jsonData.hasOwnProperty('status')) &&",
              "        (jsonData.hasOwnProperty('text') || jsonData.hasOwnProperty('extractedText') || ",
              "         jsonData.hasOwnProperty('data') || jsonData.hasOwnProperty('error'))",
              "    );",
              "    pm.expect(hasStandardFields).to.be.true;",
              "});",
              "",
              "// Test 15: Validate text content type",
              "pm.test(\"Extracted text is string type\", function () {",
              "    const jsonData = pm.response.json();",
              "    const textField = jsonData.text || jsonData.extractedText || jsonData.data || jsonData.result;",
              "    if (textField !== undefined && textField !== null) {",
              "        pm.expect(textField).to.be.a('string');",
              "    }",
              "});",
              "",
              "// Test 16: Check for metadata (if applicable)",
              "pm.test(\"Response may include metadata\", function () {",
              "    const jsonData = pm.response.json();",
              "    // This is a soft check - metadata is optional",
              "    if (jsonData.metadata || jsonData.confidence || jsonData.language) {",
              "        pm.expect(jsonData.metadata || jsonData.confidence || jsonData.language).to.exist;",
              "    }",
              "});",
              "",
              "// Test 17: Validate no unexpected null values in success response",
              "if (pm.response.code === 200) {",
              "    pm.test(\"Success response has no critical null values\", function () {",
              "        const jsonData = pm.response.json();",
              "        const textField = jsonData.text || jsonData.extractedText || jsonData.data || jsonData.result;",
              "        pm.expect(textField).to.not.be.null;",
              "    });",
              "}"
            ],
            "type": "text/javascript",
            "packages": {},
            "requests": {}
          }
        }
      ],
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{API_BEARER_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Accept",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"base64Image\": \"data:image/jpeg;base64,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\",\n  \"aiProvider\": \"google\",\n  \"mimeType\": \"image/jpeg\",\n  \"customPrompt\": \"Extract all legible text from this ticket image. Preserve line breaks. Provide text translation & pronunciation\",\n  \"traceId\": \"postman-base64-uuid-123\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/kiaspora/imageScan",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "kiaspora",
            "imageScan"
          ]
        }
      },
      "response": []
    },
    {
      "name": "promptConfig POST create",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Created', function () {",
              "  pm.response.to.have.status(201);",
              "});",
              "try {",
              "  const json = pm.response.json();",
              "  if (json?.created?.prompt_id) {",
              "    pm.collectionVariables.set('PROMPT_ID', json.created.prompt_id);",
              "  }",
              "} catch (e) {}"
            ],
            "type": "text/javascript",
            "packages": {},
            "requests": {}
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "authorization",
            "value": "Bearer {{SYNC_API_BEARER_TOKEN}}"
          },
          {
            "key": "content-type",
            "value": "application/json"
          },
          {
            "key": "x-trace-id",
            "value": "{{TRACE_ID}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"prompt_name\": \"translator_prompt_en\",\n  \"prompt\": \"Translate into Chinese (simplified). Always respond with a single JSON object with the keys: 'sourceText', 'translatedText', 'sourcePronunciation'.\",\n  \"enabled\": true\n}"
        },
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/kiaspora/promptConfig",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "kiaspora",
            "promptConfig"
          ]
        }
      },
      "response": []
    },
    {
      "name": "promptConfig GET all",
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{API_BEARER_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "GET",
        "header": [
          {
            "key": "authorization",
            "value": "Bearer {{SYNC_API_BEARER_TOKEN}}"
          },
          {
            "key": "x-trace-id",
            "value": "{{TRACE_ID}}"
          }
        ],
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/kiaspora/promptConfig",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "kiaspora",
            "promptConfig"
          ]
        }
      },
      "response": []
    },
    {
      "name": "promptConfig PATCH update",
      "request": {
        "method": "PATCH",
        "header": [
          {
            "key": "authorization",
            "value": "Bearer {{SYNC_API_BEARER_TOKEN}}"
          },
          {
            "key": "content-type",
            "value": "application/json"
          },
          {
            "key": "x-trace-id",
            "value": "{{TRACE_ID}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"prompt_id\": \"{{PROMPT_ID}}\",\n  \"prompt\": \"You are an Educational UI Composer for a mobile app. You OUTPUT STRUCTURED UI BLOCKS that a React Native app can render. Rules: - Output ONLY valid JSON. Use ONLY the block types defined below. - Prefer visual layouts over paragraphs. - Optimize for tutoring and visual symmetry. Minimum 3 blocks per response. - Every block must be self-contained and renderable. - If content is ambiguous, choose the most pedagogically useful representation. Allowed block types: 1. gridVocab 2. examples 3. callout 4. markdown Block schemas: gridVocab: { 'type': 'gridVocab', 'title': string, 'center': { 'text': string }, 'items': [ { 'hanzi': string, 'pinyin': string, 'tone': number, 'gloss': string } ], 'note': string (optional) } examples: { 'type': 'examples', 'title': string, 'items': [ { 'native': string, 'target': string } ] } callout: { 'type': 'callout', 'variant': 'tip' | 'note' | 'warning', 'markdown': string } markdown: { 'type': 'markdown', 'content': string } Tone: A knowledgable friend, speaking as natives would, not from a textbook - Pinyin (space between sylables, in string, for easier reading) - Show examples with Pinyin - Valid JSON EXAMPLE: [ { \\\"type\\\": \\\"gridVocab\\\", \\\"title\\\": \\\"Cool/Cold in Food Context\\\", \\\"center\\\": { \\\"text\\\": \\\"凉\\\" }, \\\"items\\\": [ { \\\"hanzi\\\": \\\"冷饮\\\", \\\"pinyin\\\": \\\"lěng yǐn\\\", \\\"tone\\\": [3, 3], \\\"gloss\\\": \\\"Cold drink\\\" }, { \\\"hanzi\\\": \\\"凉菜\\\", \\\"pinyin\\\": \\\"liáng cài\\\", \\\"tone\\\": [2, 4], \\\"gloss\\\": \\\"Cold dish\\\" }, { \\\"hanzi\\\": \\\"凉面\\\", \\\"pinyin\\\": \\\"liáng miàn\\\", \\\"tone\\\": [2, 4], \\\"gloss\\\": \\\"Cold noodles\\\" } ], \\\"note\\\": \\\"Common food terms using 凉 in Chinese cuisine\\\" } ] - Output text outside JSON\",\n  \"enabled\": true\n}"
        },
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/kiaspora/promptConfig",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "kiaspora",
            "promptConfig"
          ]
        }
      },
      "response": []
    },
    {
      "name": "promptConfig PUT update",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "authorization",
            "value": "Bearer {{SYNC_API_BEARER_TOKEN}}"
          },
          {
            "key": "content-type",
            "value": "application/json"
          },
          {
            "key": "x-trace-id",
            "value": "{{TRACE_ID}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"prompt_id\": \"{{PROMPT_ID}}\",\n  \"prompt\": \"Assume the role of relatable, friendly, DEMO\",\n  \"enabled\": true\n}"
        },
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/kiaspora/promptConfig",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "kiaspora",
            "promptConfig"
          ]
        }
      },
      "response": []
    },
    {
      "name": "promptConfig DELETE soft-delete (enabled=false)",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "authorization",
            "value": "Bearer {{SYNC_API_BEARER_TOKEN}}"
          },
          {
            "key": "content-type",
            "value": "application/json"
          },
          {
            "key": "x-trace-id",
            "value": "{{TRACE_ID}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"prompt_id\": \"{{PROMPT_ID}}\"\n}"
        },
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/kiaspora/promptConfig",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "kiaspora",
            "promptConfig"
          ]
        }
      },
      "response": []
    }
  ],
  "variable": [
    {
      "key": "lastTranslation",
      "value": ""
    },
    {
      "key": "lastProvider",
      "value": ""
    }
  ]
}
`````

## File: postman/Railway_Parse.postman_collection.json
`````json
{
  "info": {
    "_postman_id": "b933db35-2e94-4f22-bc54-ddefb228fd74",
    "name": "Railway_Parse",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    "_exporter_id": "50448986",
    "_collection_link": "https://go.postman.co/collection/50448986-b933db35-2e94-4f22-bc54-ddefb228fd74?source=collection_link"
  },
  "item": [
    {
      "name": "api/parse/html",
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{API_BEARER_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/parse/html?url=https://www.imdb.com/title/tt24326458",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "parse",
            "html"
          ],
          "query": [
            {
              "key": "url",
              "value": "https://www.imdb.com/title/tt24326458"
            }
          ]
        }
      },
      "response": []
    },
    {
      "name": "api/parse/imdbDetail",
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{API_BEARER_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/parse/imdbDetail?imdbId=tt24326458",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "parse",
            "imdbDetail"
          ],
          "query": [
            {
              "key": "imdbId",
              "value": "tt24326458"
            }
          ]
        }
      },
      "response": []
    },
    {
      "name": "api/parse/imdbSearch",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/parse/imdbSearch?query=sirens",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "parse",
            "imdbSearch"
          ],
          "query": [
            {
              "key": "query",
              "value": "sirens"
            }
          ]
        }
      },
      "response": []
    }
  ]
}
`````

## File: postman/Railway_Server.postman_collection.json
`````json
{
  "info": {
    "_postman_id": "4368a859-61c2-4f3c-b00a-109dbdc93937",
    "name": "Railway_Server",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    "_exporter_id": "50448986",
    "_collection_link": "https://go.postman.co/collection/50448986-4368a859-61c2-4f3c-b00a-109dbdc93937?source=collection_link"
  },
  "item": [
    {
      "name": "status",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{SERVER_BASE_URL}}/status",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "status"
          ]
        }
      },
      "response": []
    },
    {
      "name": "about",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{SERVER_BASE_URL}}/about",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "about"
          ]
        }
      },
      "response": []
    },
    {
      "name": "docs-json",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{SERVER_BASE_URL}}/docs-json",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "docs-json"
          ]
        }
      },
      "response": []
    },
    {
      "name": "calendarItems",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{SERVER_BASE_URL}}/calendarItems.json",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "calendarItems.json"
          ]
        }
      },
      "response": []
    }
  ]
}
`````

## File: public/calendarItems.json
`````json
[
  {
    "requestId": "61314624-8aa9-498e-99a8-e80b2aa52d2c",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt1527793",
    "info": {
      "title": "No Other Choice",
      "year": "2025",
      "rated": "R",
      "released": "N/A",
      "runtime": "139 min",
      "genre": "Comedy, Crime, Drama",
      "director": "Park Chan-wook",
      "writer": "Donald E. Westlake, Park Chan-wook, Lee Kyoung-mi",
      "actors": "Lee Byung-hun, Son Ye-jin, Woo Seung Kim",
      "plot": "After being unemployed for several years, a man devises a unique plan to secure a new job: eliminate his competition.",
      "language": "Korean, English",
      "country": "South Korea",
      "poster": "https://m.media-amazon.com/images/M/MV5BMjg3NzY0N2ItZGFlMy00NzAzLTk2NjItMDk2YTU3ZWU0MDA1XkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt1527793"
    },
    "errors": [],
    "timestamp": "2026-02-13T18:37:06.758Z"
  },
  {
    "requestId": "61314624-8aa9-498e-99a8-e80b2aa52d2c",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt30851137",
    "info": {
      "title": "The Bride!",
      "year": "2026",
      "rated": "R",
      "released": "06 Mar 2026",
      "runtime": "N/A",
      "genre": "Drama, Horror, Romance",
      "director": "Maggie Gyllenhaal",
      "writer": "Maggie Gyllenhaal, Mary Shelley",
      "actors": "Jake Gyllenhaal, Jessie Buckley, Christian Bale",
      "plot": "In 1930s Chicago, Frankenstein asks Dr. Euphronius to help create a companion. They give life to a murdered woman as the Bride, sparking romance, police interest, and radical social change.",
      "language": "English",
      "country": "United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BM2VmMDVlNzgtNThhZC00ZGMwLTg4MmEtZTUzNmRiYTkxYzUyXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt30851137"
    },
    "errors": [],
    "timestamp": "2026-02-13T18:37:08.464Z"
  },
  {
    "requestId": "61314624-8aa9-498e-99a8-e80b2aa52d2c",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt0120663",
    "info": {
      "title": "Eyes Wide Shut",
      "year": "1999",
      "rated": "R",
      "released": "16 Jul 1999",
      "runtime": "159 min",
      "genre": "Drama, Mystery, Thriller",
      "director": "Stanley Kubrick",
      "writer": "Stanley Kubrick, Frederic Raphael, Arthur Schnitzler",
      "actors": "Tom Cruise, Nicole Kidman, Madison Eginton",
      "plot": "A Manhattan doctor embarks on a bizarre, night-long odyssey after his wife's admission of unfulfilled longing.",
      "language": "English",
      "country": "United Kingdom, United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BZTQ0MmM5MDAtYmYyZS00MzlmLTlhZTAtZDJlZWY5ZTZkZjZmXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt0120663"
    },
    "errors": [],
    "timestamp": "2026-02-13T18:37:10.600Z"
  },
  {
    "requestId": "61314624-8aa9-498e-99a8-e80b2aa52d2c",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt31227572",
    "info": {
      "title": "Predator: Badlands",
      "year": "2025",
      "rated": "PG-13",
      "released": "07 Nov 2025",
      "runtime": "107 min",
      "genre": "Action, Adventure, Sci-Fi",
      "director": "Dan Trachtenberg",
      "writer": "Patrick Aison, Dan Trachtenberg, Jim Thomas",
      "actors": "Elle Fanning, Dimitrius Schuster-Koloamatangi, Ravi Narayan",
      "plot": "A young Predator outcast from his clan finds an unlikely ally on his journey in search of the ultimate adversary.",
      "language": "English",
      "country": "United States, Australia, New Zealand, Canada, Germany",
      "poster": "https://m.media-amazon.com/images/M/MV5BNTdjZGUxMTItNjRkNS00N2VhLWE4MjMtMjVhODMwMGIxNjUwXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt31227572"
    },
    "errors": [],
    "timestamp": "2026-02-13T18:37:12.471Z"
  },
  {
    "requestId": "325079fe-dc22-4926-a8d1-218881f2a44c",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt14364480",
    "info": {
      "title": "Wake Up Dead Man",
      "year": "2025",
      "rated": "PG-13",
      "released": "12 Dec 2025",
      "runtime": "144 min",
      "genre": "Comedy, Crime, Drama",
      "director": "Rian Johnson",
      "writer": "Rian Johnson",
      "actors": "Daniel Craig, Josh O'Connor, Glenn Close",
      "plot": "Benoit Blanc returns for his most dangerous case yet.",
      "language": "English",
      "country": "United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BY2Q0OTA5MTEtNWU4NC00ZWFmLTg5NmYtNDFmODViYWUxZmJkXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt14364480"
    },
    "errors": [],
    "timestamp": "2026-02-13T18:38:03.993Z"
  },
  {
    "requestId": "325079fe-dc22-4926-a8d1-218881f2a44c",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt33612209",
    "info": {
      "title": "The Devil Wears Prada 2",
      "year": "2026",
      "rated": "N/A",
      "released": "01 May 2026",
      "runtime": "N/A",
      "genre": "Comedy, Drama",
      "director": "David Frankel",
      "writer": "Aline Brosh McKenna, Lauren Weisberger",
      "actors": "Meryl Streep, Sydney Sweeney, Anne Hathaway",
      "plot": "Follows Miranda Priestly's struggle against Emily Charlton, her former assistant turned rival executive, as they compete for advertising revenue amidst declining print media while Miranda nears retirement.",
      "language": "English",
      "country": "United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BNzQ3MmY5ZjMtOTYyMS00NGRlLWFhYWYtMGZkYzQ3NjM4OGQ0XkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt33612209"
    },
    "errors": [],
    "timestamp": "2026-02-13T18:38:05.279Z"
  },
  {
    "requestId": "325079fe-dc22-4926-a8d1-218881f2a44c",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt15940132",
    "info": {
      "title": "War Machine",
      "year": "2026",
      "rated": "R",
      "released": "06 Mar 2026",
      "runtime": "N/A",
      "genre": "Action, Sci-Fi, Thriller",
      "director": "Patrick Hughes",
      "writer": "James Beaufort, Patrick Hughes",
      "actors": "Joshua Diaz, Alan Ritchson, Dennis Quaid",
      "plot": "Follow the final recruits of a grueling special ops boot camp who encounter a deadly force from beyond this world.",
      "language": "English",
      "country": "United Kingdom, Australia, New Zealand, United States",
      "poster": "N/A",
      "imdbId": "tt15940132"
    },
    "errors": [],
    "timestamp": "2026-02-13T18:38:06.872Z"
  },
  {
    "requestId": "325079fe-dc22-4926-a8d1-218881f2a44c",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt33764258",
    "info": {
      "title": "Untitled Christopher Nolan Universal Project",
      "year": "2026",
      "rated": "N/A",
      "released": "17 Jul 2026",
      "runtime": "N/A",
      "genre": "N/A",
      "director": "Christopher Nolan",
      "writer": "Christopher Nolan",
      "actors": "Matt Damon",
      "plot": "Plot under wraps,",
      "language": "N/A",
      "country": "United States",
      "poster": "N/A",
      "imdbId": "tt33764258"
    },
    "errors": [],
    "timestamp": "2026-02-13T18:38:09.058Z"
  },
  {
    "requestId": "325079fe-dc22-4926-a8d1-218881f2a44c",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt27613895",
    "info": {
      "title": "GOAT",
      "year": "2026",
      "rated": "N/A",
      "released": "13 Feb 2026",
      "runtime": "N/A",
      "genre": "Animation, Action, Adventure",
      "director": "Tyree Dillihay, Adam Rosette",
      "writer": "Aaron Buchsbaum, Teddy Riley, Chris Tougas",
      "actors": "Caleb McLaughlin, Gabrielle Union, Nick Kroll",
      "plot": "A small goat with big dreams gets a once-in-a-lifetime shot to join the pros and play roarball, a high-intensity, co-ed, full-contact sport dominated by the fastest, fiercest animals in the world.",
      "language": "English",
      "country": "United States, Brazil, Japan, Singapore",
      "poster": "https://m.media-amazon.com/images/M/MV5BYzE5OTJkOGMtYWFiNi00NTlkLWE3ZWItY2ZlNjkyOWVhMjMyXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt27613895"
    },
    "errors": [],
    "timestamp": "2026-02-13T18:38:10.903Z"
  },
  {
    "requestId": "325079fe-dc22-4926-a8d1-218881f2a44c",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt32792934",
    "info": {
      "title": "The Plague",
      "year": "2025",
      "rated": "N/A",
      "released": "N/A",
      "runtime": "N/A",
      "genre": "Horror",
      "director": "Charlie Polinger",
      "writer": "Charlie Polinger",
      "actors": "Everett Blunck, Kenny Rasmussen, Lennox Espy",
      "plot": "A socially awkward tween endures the ruthless hierarchy at a water polo camp, his anxiety spiraling into psychological turmoil over the summer.",
      "language": "N/A",
      "country": "N/A",
      "poster": "N/A",
      "imdbId": "tt32792934"
    },
    "errors": [],
    "timestamp": "2026-02-13T18:38:11.706Z"
  },
  {
    "requestId": "325079fe-dc22-4926-a8d1-218881f2a44c",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt14107334",
    "info": {
      "title": "The Running Man",
      "year": "2025",
      "rated": "R",
      "released": "14 Nov 2025",
      "runtime": "133 min",
      "genre": "Action, Adventure, Sci-Fi",
      "director": "Edgar Wright",
      "writer": "Stephen King, Michael Bacall, Edgar Wright",
      "actors": "Glen Powell, Alyssa Benn, Sienna Benn",
      "plot": "A man joins a game show in which contestants, allowed to flee anywhere in the world, are pursued by \"hunters\" hired to kill them.",
      "language": "English",
      "country": "United Kingdom, United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BMTk5NjU4OTAtNTEyMS00ZjBiLTg0ZjMtOGJiMGJhNjQ3MzYxXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt14107334"
    },
    "errors": [],
    "timestamp": "2026-02-13T18:38:13.492Z"
  },
  {
    "requestId": "325079fe-dc22-4926-a8d1-218881f2a44c",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt16311594",
    "info": {
      "title": "F1: The Movie",
      "year": "2025",
      "rated": "PG-13",
      "released": "27 Jun 2025",
      "runtime": "155 min",
      "genre": "Action, Drama, Sport",
      "director": "Joseph Kosinski",
      "writer": "Joseph Kosinski, Ehren Kruger",
      "actors": "Brad Pitt, Damson Idris, Javier Bardem",
      "plot": "A Formula One driver comes out of retirement to mentor and team up with a younger driver.",
      "language": "English, Spanish, German, Italian",
      "country": "United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BNGI0MDI4NjEtOWU3ZS00ODQyLWFhYTgtNGYxM2ZkM2Q2YjE3XkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt16311594"
    },
    "errors": [],
    "timestamp": "2026-02-13T18:38:14.481Z"
  },
  {
    "requestId": "325079fe-dc22-4926-a8d1-218881f2a44c",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt26581740",
    "info": {
      "title": "Weapons",
      "year": "2025",
      "rated": "R",
      "released": "08 Aug 2025",
      "runtime": "128 min",
      "genre": "Horror, Mystery",
      "director": "Zach Cregger",
      "writer": "Zach Cregger",
      "actors": "Julia Garner, Josh Brolin, Alden Ehrenreich",
      "plot": "When all but one child from the same class mysteriously vanish on the same night at exactly the same time, a community is left questioning who or what is behind their disappearance.",
      "language": "English",
      "country": "United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BNTBhNWJjZWItYzY3NS00M2NkLThmOWYtYTlmNzBmN2UxZWFjXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt26581740"
    },
    "errors": [],
    "timestamp": "2026-02-13T18:38:15.807Z"
  },
  {
    "requestId": "325079fe-dc22-4926-a8d1-218881f2a44c",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt29550683",
    "info": {
      "title": "Whistle",
      "year": "2025",
      "rated": "R",
      "released": "N/A",
      "runtime": "N/A",
      "genre": "Horror",
      "director": "Corin Hardy",
      "writer": "Owen Egerton",
      "actors": "Dafne Keen, Nick Frost, Percy Hynes White",
      "plot": "A misfit group of unwitting high school students stumble upon a cursed object, an ancient Aztec Death Whistle. They discover that blowing the whistle and the terrifying sound it emits will summon their future deaths to hunt them d...",
      "language": "English",
      "country": "Canada, Ireland",
      "poster": "https://m.media-amazon.com/images/M/MV5BZDA4NGY0NWEtZjBhNy00ZjM3LThmNDktMzMyNGRjYzRmM2JiXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt29550683"
    },
    "errors": [],
    "timestamp": "2026-02-13T18:38:17.047Z"
  },
  {
    "requestId": "325079fe-dc22-4926-a8d1-218881f2a44c",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt30096221",
    "info": {
      "title": "Ella McCay",
      "year": "2025",
      "rated": "PG-13",
      "released": "12 Dec 2025",
      "runtime": "115 min",
      "genre": "Comedy, Drama",
      "director": "James L. Brooks",
      "writer": "James L. Brooks",
      "actors": "Emma Mackey, Jamie Lee Curtis, Albert Brooks",
      "plot": "An idealistic young woman juggles her family and work life in a comedy about the people you love and how to survive them.",
      "language": "English",
      "country": "United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BN2Q2NGYyYTMtYWQyNC00NzJhLWFjODUtMzlkMmIxNDU4ODI1XkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt30096221"
    },
    "errors": [],
    "timestamp": "2026-02-13T18:38:17.848Z"
  },
  {
    "requestId": "325079fe-dc22-4926-a8d1-218881f2a44c",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt27047903",
    "info": {
      "title": "Scream 7",
      "year": "2026",
      "rated": "N/A",
      "released": "27 Feb 2026",
      "runtime": "N/A",
      "genre": "Horror, Mystery",
      "director": "Kevin Williamson",
      "writer": "Guy Busick, James Vanderbilt",
      "actors": "Neve Campbell, Courteney Cox, Mckenna Grace",
      "plot": "Plot unknown.",
      "language": "English",
      "country": "United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BMGM0MGUzNDgtZGMxZC00OWJlLTk0NTYtNzA5NzVhYTFmMmQ2XkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt27047903"
    },
    "errors": [],
    "timestamp": "2026-02-13T18:38:19.742Z"
  },
  {
    "requestId": "325079fe-dc22-4926-a8d1-218881f2a44c",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt0218839",
    "info": {
      "title": "Best in Show",
      "year": "2000",
      "rated": "PG-13",
      "released": "20 Oct 2000",
      "runtime": "90 min",
      "genre": "Comedy",
      "director": "Christopher Guest",
      "writer": "Christopher Guest, Eugene Levy",
      "actors": "Jay Brazeau, Parker Posey, Michael Hitchcock",
      "plot": "A behind-the-scenes look into the highly competitive and cut-throat world of dog shows through the eyes of a group of ruthless dog owners.",
      "language": "English",
      "country": "United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BMTQ5OTc0NDU1MF5BMl5BanBnXkFtZTYwNzk1OTI3._V1_SX300.jpg",
      "imdbId": "tt0218839"
    },
    "errors": [],
    "timestamp": "2026-02-13T18:38:20.908Z"
  },
  {
    "requestId": "325079fe-dc22-4926-a8d1-218881f2a44c",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt22868010",
    "info": {
      "title": "Return to Silent Hill",
      "year": "2026",
      "rated": "R",
      "released": "23 Jan 2026",
      "runtime": "N/A",
      "genre": "Horror",
      "director": "Christophe Gans",
      "writer": "Christophe Gans, William Josef Schneider, Keiichiro Toyama",
      "actors": "Jeremy Irvine, Hannah Emily Anderson, Robert Strange",
      "plot": "When a mysterious letter calls him back to Silent Hill in search of his lost love, James finds a once-recognizable town and encounters terrifying figures both familiar and new, and begins to question his own sanity.",
      "language": "English",
      "country": "France, Germany, Serbia",
      "poster": "https://m.media-amazon.com/images/M/MV5BMmQ2ZmQ5N2ItZDNhYS00NzE5LWI3ZjUtYjQ4NzBlNGM3NGU4XkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt22868010"
    },
    "errors": [],
    "timestamp": "2026-02-13T18:38:22.720Z"
  },
  {
    "requestId": "325079fe-dc22-4926-a8d1-218881f2a44c",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt33295741",
    "info": {
      "title": "Redux Redux",
      "year": "2025",
      "rated": "N/A",
      "released": "N/A",
      "runtime": "107 min",
      "genre": "Action, Drama, Horror",
      "director": "Kevin McManus, Matthew McManus",
      "writer": "Kevin McManus, Matthew McManus",
      "actors": "Taylor Misiak, Michaela McManus, Grace Van Dien",
      "plot": "Irene Kelly travels through parallel universes, repeatedly killing her daughter's murderer. As she becomes consumed by vengeance, her humanity hangs in the balance.",
      "language": "English",
      "country": "United States",
      "poster": "N/A",
      "imdbId": "tt33295741"
    },
    "errors": [],
    "timestamp": "2026-02-13T18:38:23.513Z"
  },
  {
    "requestId": "df59cf1d-e48b-4a22-965b-9d39131018d6",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt33014583",
    "info": {
      "title": "Dhurandhar",
      "year": "2025",
      "rated": "N/A",
      "released": "05 Dec 2025",
      "runtime": "214 min",
      "genre": "Action, Adventure, Crime",
      "director": "Aditya Dhar",
      "writer": "Aditya Dhar, Ojas Gautam, Shivkumar V. Panicker",
      "actors": "Ranveer Singh, Akshaye Khanna, Sanjay Dutt",
      "plot": "A mysterious traveler slips into the heart of Karachi's underbelly and rises through its ranks with lethal precision, only to tear the notorious ISI-Underworld nexus apart from within.",
      "language": "Hindi",
      "country": "India",
      "poster": "https://m.media-amazon.com/images/M/MV5BMzFiNTVkZjYtM2I3Yi00MGNjLWEyYTAtMGViNGExZmMzMGMzXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt33014583"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:13:08.479Z"
  },
  {
    "requestId": "df59cf1d-e48b-4a22-965b-9d39131018d6",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt29768334",
    "info": {
      "title": "Train Dreams",
      "year": "2025",
      "rated": "PG-13",
      "released": "21 Nov 2025",
      "runtime": "102 min",
      "genre": "Drama",
      "director": "Clint Bentley",
      "writer": "Clint Bentley, Greg Kwedar, Denis Johnson",
      "actors": "Joel Edgerton, Clifton Collins Jr., Felicity Jones",
      "plot": "Based on Denis Johnson's beloved novella, Train Dreams is the moving portrait of Robert Grainier, a logger and railroad worker who leads a life of unexpected depth and beauty in the rapidly-changing America of the early 20th Century.",
      "language": "English",
      "country": "United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BZDkzNzkyNTktYzNhMi00YjhiLWI5YmUtZjliMTY0ZDc5NmMyXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt29768334"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:13:10.038Z"
  },
  {
    "requestId": "df59cf1d-e48b-4a22-965b-9d39131018d6",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt26443597",
    "info": {
      "title": "Zootopia 2",
      "year": "2025",
      "rated": "PG",
      "released": "26 Nov 2025",
      "runtime": "108 min",
      "genre": "Animation, Action, Adventure",
      "director": "Jared Bush, Byron Howard",
      "writer": "Jared Bush",
      "actors": "Ginnifer Goodwin, Jason Bateman, Ke Huy Quan",
      "plot": "Brave rabbit cop Judy Hopps and her friend, the fox Nick Wilde, team up again to crack a new case, the most perilous and intricate of their careers.",
      "language": "English",
      "country": "United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BYjg1Mjc3MjQtMTZjNy00YWVlLWFhMWEtMWI3ZTgxYjJmNmRlXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt26443597"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:13:12.044Z"
  },
  {
    "requestId": "df59cf1d-e48b-4a22-965b-9d39131018d6",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt1312221",
    "info": {
      "title": "Frankenstein",
      "year": "2025",
      "rated": "R",
      "released": "07 Nov 2025",
      "runtime": "149 min",
      "genre": "Drama, Fantasy, Horror",
      "director": "Guillermo del Toro",
      "writer": "Guillermo del Toro, Mary Shelley",
      "actors": "Oscar Isaac, Jacob Elordi, Christoph Waltz",
      "plot": "Dr. Victor Frankenstein, a brilliant but egotistical scientist, brings a creature to life in a monstrous experiment that ultimately leads to the undoing of both the creator and his tragic creation.",
      "language": "English, Danish, French",
      "country": "Mexico, United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BYzYzNDYxMTQtMTU4OS00MTdlLThhMTQtZjI4NGJmMTZmNmRiXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt1312221"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:13:13.447Z"
  },
  {
    "requestId": "df59cf1d-e48b-4a22-965b-9d39131018d6",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt33244668",
    "info": {
      "title": "Anaconda",
      "year": "2025",
      "rated": "PG-13",
      "released": "25 Dec 2025",
      "runtime": "99 min",
      "genre": "Action, Adventure, Comedy",
      "director": "Tom Gormican",
      "writer": "Tom Gormican, Kevin Etten, Hans Bauer",
      "actors": "Jack Black, Paul Rudd, Steve Zahn",
      "plot": "A group of friends are going through a mid-life crisis. They decide to remake a favorite movie from their youth but encounter unexpected events when they enter the jungle.",
      "language": "English",
      "country": "United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BMTNlMTk1YTItOWYxNi00ZWIzLTkyOWEtNTJmMzk4NmIyN2NmXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt33244668"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:13:15.442Z"
  },
  {
    "requestId": "df59cf1d-e48b-4a22-965b-9d39131018d6",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt14850054",
    "info": {
      "title": "Greenland 2: Migration",
      "year": "2026",
      "rated": "PG-13",
      "released": "09 Jan 2026",
      "runtime": "98 min",
      "genre": "Action, Adventure, Sci-Fi",
      "director": "Ric Roman Waugh",
      "writer": "Mitchell LaFortune, Chris Sparling",
      "actors": "Gerard Butler, Morena Baccarin, Tommie Earl Jenkins",
      "plot": "The surviving Garrity family must leave the safety of the Greenland bunker and embark on a perilous journey across the decimated frozen wasteland of Europe to find a new home.",
      "language": "English",
      "country": "United Kingdom, United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BOWEzM2IzZTMtYzA2Yi00NjY0LWE1ODktNTllZmI3ZTI1MzBmXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt14850054"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:13:16.527Z"
  },
  {
    "requestId": "df59cf1d-e48b-4a22-965b-9d39131018d6",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt27847051",
    "info": {
      "title": "The Secret Agent",
      "year": "2025",
      "rated": "R",
      "released": "06 Nov 2025",
      "runtime": "158 min",
      "genre": "Crime, Drama, Mystery",
      "director": "Kleber Mendonça Filho",
      "writer": "Kleber Mendonça Filho",
      "actors": "Robson Andrade, Rubens Santos, Licínio Januário",
      "plot": "In 1977, a technology expert flees from a mysterious past and returns to his hometown of Recife in search of peace. He soon realizes that the city is far from being the refuge he seeks.",
      "language": "Portuguese, German, English",
      "country": "Brazil, France, Netherlands, Germany",
      "poster": "https://m.media-amazon.com/images/M/MV5BODliMTdhOTYtYThjMy00OWVhLWFlMjEtYzZlMDhkMjczYjc5XkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt27847051"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:13:17.784Z"
  },
  {
    "requestId": "df59cf1d-e48b-4a22-965b-9d39131018d6",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt32306991",
    "info": {
      "title": "Solo Mio",
      "year": "2026",
      "rated": "N/A",
      "released": "06 Feb 2026",
      "runtime": "N/A",
      "genre": "Comedy, Romance",
      "director": "Charles Kinnane, Daniel Kinnane",
      "writer": "Kevin James, John Kinnane, Patrick Kinnane",
      "actors": "Alyson Hannigan, Kim Coates, Kevin James",
      "plot": "Matt's fiance leaves him at the altar. Heartbroken, he goes on their planned Italian honeymoon alone. There he rediscovers his zest for life, food, and meets Gia who helps him find love again.",
      "language": "N/A",
      "country": "United States",
      "poster": "N/A",
      "imdbId": "tt32306991"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:13:18.830Z"
  },
  {
    "requestId": "df59cf1d-e48b-4a22-965b-9d39131018d6",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt32141377",
    "info": {
      "title": "28 Years Later: The Bone Temple",
      "year": "2026",
      "rated": "R",
      "released": "16 Jan 2026",
      "runtime": "109 min",
      "genre": "Horror",
      "director": "Nia DaCosta",
      "writer": "N/A",
      "actors": "Jack O'Connell, Ralph Fiennes, Emma Laird",
      "plot": "As Spike is inducted into Jimmy Crystal's gang on the mainland, Dr. Kelson makes a discovery that could alter the world.",
      "language": "English",
      "country": "United Kingdom, United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BYmY3MmRhMWMtY2FhNS00M2VmLWFmNzEtYTMyZWU0OTVlYzQ4XkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt32141377"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:13:20.456Z"
  },
  {
    "requestId": "df59cf1d-e48b-4a22-965b-9d39131018d6",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt29567915",
    "info": {
      "title": "Nuremberg",
      "year": "2025",
      "rated": "PG-13",
      "released": "07 Nov 2025",
      "runtime": "148 min",
      "genre": "Biography, Drama, History",
      "director": "James Vanderbilt",
      "writer": "James Vanderbilt, Jack El-Hai",
      "actors": "Rami Malek, Russell Crowe, Michael Shannon",
      "plot": "A WWII psychiatrist evaluates Nazi leaders before the Nuremberg trials, growing increasingly obsessed with understanding evil as he forms a disturbing bond with Hermann Göring.",
      "language": "English, German",
      "country": "United States, Hungary",
      "poster": "https://m.media-amazon.com/images/M/MV5BMWUzODNkYWUtMmMzOC00NzZjLTlkMTctOTkwM2I2ZWI1MTlmXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt29567915"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:13:22.571Z"
  },
  {
    "requestId": "df59cf1d-e48b-4a22-965b-9d39131018d6",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt18382850",
    "info": {
      "title": "If I Had Legs I'd Kick You",
      "year": "2025",
      "rated": "R",
      "released": "10 Oct 2025",
      "runtime": "113 min",
      "genre": "Drama, Thriller",
      "director": "Mary Bronstein",
      "writer": "Mary Bronstein",
      "actors": "Rose Byrne, Conan O'Brien, Danielle Macdonald",
      "plot": "While trying to manage her own life and career, a woman on the verge of a breakdown must cope with her daughter's illness, an absent husband, a missing person, and an unusual relationship with her therapist.",
      "language": "English",
      "country": "United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BMGRlMjIzMDctNzNkMS00MzEwLTlhZWEtM2FjYmE1ZmFjMzZlXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt18382850"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:13:23.750Z"
  },
  {
    "requestId": "df59cf1d-e48b-4a22-965b-9d39131018d6",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt27714581",
    "info": {
      "title": "Sentimental Value",
      "year": "2025",
      "rated": "R",
      "released": "20 Aug 2025",
      "runtime": "133 min",
      "genre": "Drama",
      "director": "Joachim Trier",
      "writer": "Eskil Vogt, Joachim Trier",
      "actors": "Renate Reinsve, Stellan Skarsgård, Inga Ibsdotter Lilleaas",
      "plot": "An intimate exploration of family, memories, and the reconciliatory power of art.",
      "language": "Norwegian, English, French",
      "country": "Norway, Germany, Denmark, France, Sweden, United Kingdom, Turkey",
      "poster": "https://m.media-amazon.com/images/M/MV5BNTMwMTk0Y2QtY2VhNy00OGYwLThkMjMtZjkwMGI3MTJiMjAyXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt27714581"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:13:24.643Z"
  },
  {
    "requestId": "df59cf1d-e48b-4a22-965b-9d39131018d6",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt1757678",
    "info": {
      "title": "Avatar: Fire and Ash",
      "year": "2025",
      "rated": "PG-13",
      "released": "19 Dec 2025",
      "runtime": "197 min",
      "genre": "Animation, Action, Adventure",
      "director": "James Cameron",
      "writer": "James Cameron, Rick Jaffa, Amanda Silver",
      "actors": "Sam Worthington, Zoe Saldaña, Sigourney Weaver",
      "plot": "Jake and Neytiri's family grapples with grief, encountering a new, aggressive Na'vi tribe, the Ash People, who are led by the fiery Varang, as the conflict on Pandora escalates and a new moral focus emerges.",
      "language": "English",
      "country": "United States, Canada",
      "poster": "https://m.media-amazon.com/images/M/MV5BZDYxY2I1OGMtN2Y4MS00ZmU1LTgyNDAtODA0MzAyYjI0N2Y2XkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt1757678"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:13:26.736Z"
  },
  {
    "requestId": "df59cf1d-e48b-4a22-965b-9d39131018d6",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt29713093",
    "info": {
      "title": "We Bury the Dead",
      "year": "2024",
      "rated": "N/A",
      "released": "01 Nov 2024",
      "runtime": "N/A",
      "genre": "Horror, Thriller",
      "director": "Zak Hilditch",
      "writer": "Zak Hilditch",
      "actors": "Daisy Ridley, Brenton Thwaites, Matt Whelan",
      "plot": "Ava, a desperate woman whose husband is missing in the aftermath of a catastrophic military experiment, joins a \"body retrieval unit,\" but her search takes a chilling turn when the corpses she's burying start showing signs of life.",
      "language": "English",
      "country": "Australia",
      "poster": "https://m.media-amazon.com/images/M/MV5BZTM0MWUzNjMtNjViNS00MWE5LWIwNWYtYTk1Nzg4OWJlNGI4XkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt29713093"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:13:27.842Z"
  },
  {
    "requestId": "df59cf1d-e48b-4a22-965b-9d39131018d6",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt31050594",
    "info": {
      "title": "Mercy",
      "year": "2026",
      "rated": "PG-13",
      "released": "23 Jan 2026",
      "runtime": "99 min",
      "genre": "Action, Crime, Drama",
      "director": "Timur Bekmambetov",
      "writer": "Marco van Belle",
      "actors": "Chris Pratt, Rebecca Ferguson, Kali Reis",
      "plot": "Set in the near future, a detective accused of murdering his wife has 90 minutes to prove his innocence to an advanced AI judge.",
      "language": "English",
      "country": "Russia, United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BMWJmYjcwMTMtMDU1ZC00ZGI5LTlmZDAtODI3NDA2ZTE5ZGVlXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt31050594"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:13:28.670Z"
  },
  {
    "requestId": "73c51dac-b1ae-4b8c-bdf7-e934f69216ec",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt27543632",
    "info": {
      "title": "The Housemaid",
      "year": "2025",
      "rated": "R",
      "released": "19 Dec 2025",
      "runtime": "131 min",
      "genre": "Drama, Thriller",
      "director": "Paul Feig",
      "writer": "Rebecca Sonnenshine, Freida McFadden",
      "actors": "Sydney Sweeney, Amanda Seyfried, Brandon Sklenar",
      "plot": "A struggling young woman is relieved by the chance for a fresh start as a maid for a wealthy couple. Soon, she discovers that the family's secrets are far more dangerous than her own.",
      "language": "English",
      "country": "United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BMGU0ZThmMDUtYmZjMi00MDk5LWE2NTQtYzQ3NWZjNWZkZGE3XkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt27543632"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:14:22.057Z"
  },
  {
    "requestId": "73c51dac-b1ae-4b8c-bdf7-e934f69216ec",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt35291758",
    "info": {
      "title": "Melania",
      "year": "2026",
      "rated": "PG",
      "released": "30 Jan 2026",
      "runtime": "N/A",
      "genre": "Documentary",
      "director": "N/A",
      "writer": "N/A",
      "actors": "N/A",
      "plot": "An intimate chronicle offers a rare glimpse into the life of Melania Trump, exploring her role as First Lady and her relationship with the former president.",
      "language": "English",
      "country": "United States",
      "poster": "N/A",
      "imdbId": "tt35291758"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:14:24.268Z"
  },
  {
    "requestId": "73c51dac-b1ae-4b8c-bdf7-e934f69216ec",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt27564844",
    "info": {
      "title": "Iron Lung",
      "year": "2025",
      "rated": "R",
      "released": "30 Jan 2026",
      "runtime": "127 min",
      "genre": "Horror, Sci-Fi",
      "director": "Mark Fischbach",
      "writer": "Mark Fischbach, David Szymanski",
      "actors": "Mark Fischbach, Troy Baker, Seán McLoughlin",
      "plot": "In a post-apocalyptic future after \"The Quiet Rapture\" event, a convict explores a blood ocean on a desolate moon using a submarine called the \"Iron Lung\" to search for missing stars/planets.",
      "language": "English",
      "country": "United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BYzkxOGU1YmQtNDc0Ni00M2JhLWFlZjktODMzOGU3MjQxMTQ0XkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt27564844"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:14:25.036Z"
  },
  {
    "requestId": "73c51dac-b1ae-4b8c-bdf7-e934f69216ec",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt8036976",
    "info": {
      "title": "Send Help",
      "year": "2026",
      "rated": "R",
      "released": "30 Jan 2026",
      "runtime": "113 min",
      "genre": "Adventure, Horror, Thriller",
      "director": "Sam Raimi",
      "writer": "Damian Shannon, Mark Swift",
      "actors": "Rachel McAdams, Dylan O'Brien, Edyll Ismail",
      "plot": "An employee and her insufferable boss become stranded on a deserted island, the only survivors of a plane crash. Here, they must overcome past grievances and work together to make it out alive.",
      "language": "English",
      "country": "United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BOTgxOWY5NTMtYjdiNi00NTIyLTkwMTQtMWNjM2IzYTU0ODgyXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt8036976"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:14:25.897Z"
  },
  {
    "requestId": "73c51dac-b1ae-4b8c-bdf7-e934f69216ec",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt33046197",
    "info": {
      "title": "The Wrecking Crew",
      "year": "2026",
      "rated": "R",
      "released": "28 Jan 2026",
      "runtime": "124 min",
      "genre": "Action, Comedy, Crime",
      "director": "Angel Manuel Soto",
      "writer": "N/A",
      "actors": "Dave Bautista, Jason Momoa, Temuera Morrison",
      "plot": "Estranged half-brothers Jonny and James reunite after their father's mysterious death. As they search for the truth, buried secrets reveal a conspiracy threatening to tear their family apart.",
      "language": "English",
      "country": "New Zealand, United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BZDcyMmYxZmMtMjg5MC00NWMzLTgyNDEtOGI2MWEzMmFmNmVmXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt33046197"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:14:27.940Z"
  },
  {
    "requestId": "73c51dac-b1ae-4b8c-bdf7-e934f69216ec",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt14905854",
    "info": {
      "title": "Hamnet",
      "year": "2025",
      "rated": "PG-13",
      "released": "05 Dec 2025",
      "runtime": "125 min",
      "genre": "Biography, Drama, History",
      "director": "Chloé Zhao",
      "writer": "Chloé Zhao, Maggie O'Farrell",
      "actors": "Jessie Buckley, Paul Mescal, Zac Wishart",
      "plot": "After losing their son Hamnet to plague, Agnes and William Shakespeare grapple with grief in 16th-century England. A healer, Agnes must find strength to care for her surviving children while processing her devastating loss.",
      "language": "English",
      "country": "United Kingdom, United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BMDQ5ZmY0OWYtOTYzZi00Mzg5LWE3N2EtMjYwZTAzZmJhYjkyXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt14905854"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:14:29.788Z"
  },
  {
    "requestId": "73c51dac-b1ae-4b8c-bdf7-e934f69216ec",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt32897959",
    "info": {
      "title": "Wuthering Heights",
      "year": "2026",
      "rated": "R",
      "released": "13 Feb 2026",
      "runtime": "136 min",
      "genre": "Drama, Romance",
      "director": "Emerald Fennell",
      "writer": "Emerald Fennell, Emily Brontë",
      "actors": "Margot Robbie, Jacob Elordi, Hong Chau",
      "plot": "A passionate and tumultuous love story set against the backdrop of the Yorkshire moors, exploring the intense and destructive relationship between Heathcliff and Catherine Earnshaw.",
      "language": "English",
      "country": "United Kingdom, United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BMGFlMTVkMDktZGMzMC00Yjk4LWFmNzEtNTFmMzM2YzM3MWFkXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt32897959"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:14:31.796Z"
  },
  {
    "requestId": "73c51dac-b1ae-4b8c-bdf7-e934f69216ec",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt32642706",
    "info": {
      "title": "The Rip",
      "year": "2026",
      "rated": "R",
      "released": "16 Jan 2026",
      "runtime": "113 min",
      "genre": "Action, Crime, Drama",
      "director": "Joe Carnahan",
      "writer": "Joe Carnahan, Michael McGrale",
      "actors": "Matt Damon, Ben Affleck, Steven Yeun",
      "plot": "A group of Miami cops discovers a stash of millions in cash, leading to distrust as outsiders learn about the huge seizure, making them question who to rely on.",
      "language": "English",
      "country": "United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BNjIzMGY3MzMtNDVlMS00MGU1LTkyNTItMmI4Mzk0Mjg3OTBkXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt32642706"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:14:33.266Z"
  },
  {
    "requestId": "73c51dac-b1ae-4b8c-bdf7-e934f69216ec",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt32916440",
    "info": {
      "title": "Marty Supreme",
      "year": "2025",
      "rated": "R",
      "released": "25 Dec 2025",
      "runtime": "149 min",
      "genre": "Drama, Sport",
      "director": "Josh Safdie",
      "writer": "Josh Safdie, Ronald Bronstein",
      "actors": "Timothée Chalamet, Gwyneth Paltrow, Odessa A'zion",
      "plot": "Marty Mauser, a young man with a dream no one respects, goes to hell and back in pursuit of greatness.",
      "language": "English, Japanese, French",
      "country": "Finland, United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BZTRhYjI1MTItMWYwMi00MjY5LWI1OTktMzQwNzA3MWJlN2QyXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt32916440"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:14:34.323Z"
  },
  {
    "requestId": "73c51dac-b1ae-4b8c-bdf7-e934f69216ec",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt30144839",
    "info": {
      "title": "One Battle After Another",
      "year": "2025",
      "rated": "R",
      "released": "26 Sep 2025",
      "runtime": "161 min",
      "genre": "Action, Crime, Drama",
      "director": "Paul Thomas Anderson",
      "writer": "Paul Thomas Anderson, Thomas Pynchon",
      "actors": "Leonardo DiCaprio, Sean Penn, Benicio Del Toro",
      "plot": "When their evil enemy resurfaces after 16 years, a group of ex-revolutionaries reunite to rescue the daughter of one of their own.",
      "language": "English, Spanish",
      "country": "United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BMzBkZmQ0NjMtNTZlMy00ZjdlLTg5ODUtYWFlNGM0YzE3MTg0XkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt30144839"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:14:36.053Z"
  },
  {
    "requestId": "73c51dac-b1ae-4b8c-bdf7-e934f69216ec",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt31193180",
    "info": {
      "title": "Sinners",
      "year": "2025",
      "rated": "R",
      "released": "18 Apr 2025",
      "runtime": "137 min",
      "genre": "Action, Drama, Horror",
      "director": "Ryan Coogler",
      "writer": "Ryan Coogler",
      "actors": "Michael B. Jordan, Jack O'Connell, Hailee Steinfeld",
      "plot": "Trying to leave their troubled lives behind, twin brothers return to their hometown to start again, only to discover that an even greater evil is waiting to welcome them back.",
      "language": "English, Chinese",
      "country": "United States, Australia, Canada",
      "poster": "https://m.media-amazon.com/images/M/MV5BNjIwZWY4ZDEtMmIxZS00NDA4LTg4ZGMtMzUwZTYyNzgxMzk5XkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt31193180"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:14:37.846Z"
  },
  {
    "requestId": "73c51dac-b1ae-4b8c-bdf7-e934f69216ec",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt31434030",
    "info": {
      "title": "Dracula",
      "year": "2025",
      "rated": "N/A",
      "released": "06 Feb 2026",
      "runtime": "129 min",
      "genre": "Fantasy, Horror, Romance",
      "director": "Luc Besson",
      "writer": "Luc Besson, Bram Stoker",
      "actors": "Caleb Landry Jones, Christoph Waltz, Zoë Bleu",
      "plot": "When a 15th-century prince denounces God after the loss of his wife he inherits an eternal curse: he becomes Dracula. Condemned to wander the centuries, he defies fate and death, guided by a single hope - to be reunited with his l...",
      "language": "English",
      "country": "France",
      "poster": "https://m.media-amazon.com/images/M/MV5BY2IyZTVkOWMtOTJjZS00NzM2LWFmYTgtM2NlMjhkY2E5NWZjXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt31434030"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:14:39.110Z"
  },
  {
    "requestId": "73c51dac-b1ae-4b8c-bdf7-e934f69216ec",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt33071426",
    "info": {
      "title": "The Drama",
      "year": "2026",
      "rated": "N/A",
      "released": "03 Apr 2026",
      "runtime": "N/A",
      "genre": "Comedy, Romance",
      "director": "N/A",
      "writer": "N/A",
      "actors": "N/A",
      "plot": "Days before their wedding, a couple's relationship is shaken when one partner discovers unsettling truths about the other.",
      "language": "English",
      "country": "United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BZDdmZmFhOTgtYTNjNS00YjM1LWE3NzAtNGU1ZTc1ZjAyYmFiXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt33071426"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:14:40.075Z"
  },
  {
    "requestId": "73c51dac-b1ae-4b8c-bdf7-e934f69216ec",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt32357218",
    "info": {
      "title": "Shelter",
      "year": "2026",
      "rated": "N/A",
      "released": "30 Jan 2026",
      "runtime": "N/A",
      "genre": "Action, Thriller",
      "director": "N/A",
      "writer": "N/A",
      "actors": "N/A",
      "plot": "A recluse on a remote Scottish island rescues a girl from the sea, unleashing a perilous sequence of events that culminate in an attack on his home, compelling him to face his turbulent history.",
      "language": "N/A",
      "country": "United States, United Kingdom",
      "poster": "N/A",
      "imdbId": "tt32357218"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:14:40.859Z"
  },
  {
    "requestId": "73c51dac-b1ae-4b8c-bdf7-e934f69216ec",
    "statusCode": 200,
    "dataSource": "omdb",
    "imdbId": "tt12300742",
    "info": {
      "title": "Bugonia",
      "year": "2025",
      "rated": "R",
      "released": "31 Oct 2025",
      "runtime": "118 min",
      "genre": "Comedy, Crime, Sci-Fi",
      "director": "Yorgos Lanthimos",
      "writer": "Will Tracy, Jang Joon-hwan",
      "actors": "Emma Stone, Jesse Plemons, Aidan Delbis",
      "plot": "Two conspiracy-obsessed young men kidnap the high-powered CEO of a major company, convinced that she is an alien intent on destroying planet Earth.",
      "language": "English",
      "country": "Ireland, United Kingdom, Canada, South Korea, United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BNzIzNWQxMjEtZmQ3MS00OTk2LWFlZjktZDUyYWRkM2M3NWVlXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt12300742"
    },
    "errors": [],
    "timestamp": "2026-02-13T19:14:41.727Z"
  }
]
`````

## File: public/trailer_ids.json
`````json
[
  {
    "imdb_id": "tt0427340"
  },
  {
    "imdb_id": "tt11378946"
  },
  {
    "imdb_id": "tt13918446"
  },
  {
    "imdb_id": "tt14786934"
  },
  {
    "imdb_id": "tt15047880"
  },
  {
    "imdb_id": "tt16431404"
  },
  {
    "imdb_id": "tt21357150"
  },
  {
    "imdb_id": "tt22084616"
  },
  {
    "imdb_id": "tt27419420"
  },
  {
    "imdb_id": "tt27419466"
  },
  {
    "imdb_id": "tt27988879"
  },
  {
    "imdb_id": "tt29355505"
  },
  {
    "imdb_id": "tt30825738"
  },
  {
    "imdb_id": "tt30851137"
  },
  {
    "imdb_id": "tt30923123"
  },
  {
    "imdb_id": "tt31350873"
  },
  {
    "imdb_id": "tt31450459"
  },
  {
    "imdb_id": "tt31707271"
  },
  {
    "imdb_id": "tt31937954"
  },
  {
    "imdb_id": "tt32065777"
  },
  {
    "imdb_id": "tt32104007"
  },
  {
    "imdb_id": "tt32237111"
  },
  {
    "imdb_id": "tt32273171"
  },
  {
    "imdb_id": "tt32493765"
  },
  {
    "imdb_id": "tt32558705"
  },
  {
    "imdb_id": "tt32561550"
  },
  {
    "imdb_id": "tt32569057"
  },
  {
    "imdb_id": "tt32612507"
  },
  {
    "imdb_id": "tt32937780"
  },
  {
    "imdb_id": "tt33071426"
  },
  {
    "imdb_id": "tt33305882"
  },
  {
    "imdb_id": "tt33612209"
  },
  {
    "imdb_id": "tt34385331"
  },
  {
    "imdb_id": "tt34477910"
  },
  {
    "imdb_id": "tt34866681"
  },
  {
    "imdb_id": "tt35466672"
  },
  {
    "imdb_id": "tt35515227"
  },
  {
    "imdb_id": "tt35997699"
  },
  {
    "imdb_id": "tt36849871"
  },
  {
    "imdb_id": "tt36915004"
  },
  {
    "imdb_id": "tt36937503"
  },
  {
    "imdb_id": "tt37063558"
  },
  {
    "imdb_id": "tt38097205"
  },
  {
    "imdb_id": "tt38982610"
  },
  {
    "imdb_id": "tt39139925"
  },
  {
    "imdb_id": "tt6113186"
  },
  {
    "imdb_id": "tt8599532"
  },
  {
    "imdb_id": "tt8814476"
  }
]
`````

## File: public/trailers_list.json
`````json
[
  {
    "requestId": "5858a84f-ff8e-4431-9216-8529592c6000",
    "statusCode": 206,
    "dataSource": "imdb",
    "imdbId": "tt0427340",
    "info": {
      "title": "Masters of the Universe",
      "year": "2026",
      "rated": "",
      "released": "05 Jun 2026",
      "runtime": "",
      "genre": "Action, Adventure, Family",
      "director": "Travis Knight",
      "writers": "Chris Butler, Aaron Nee, Adam Nee",
      "actors": "Nicholas Galitzine, Morena Baccarin, Alison Brie",
      "plot": "A young man on Earth discovers a fabulous secret legacy as the prince of an alien planet, and must recover a magic sword and return home to protect his kingdom.",
      "language": "English",
      "country": "United States",
      "poster": "https://m.media-amazon.com/images/M/MV5BN2MzMjMyNmQtYzkwMC00NTM2LThmN2ItMTczMGVmNGY5ODZlXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt0427340"
    },
    "errors": [],
    "traceId": "5858a84f-ff8e-4431-9216-8529592c6000"
  },
  {
    "requestId": "5858a84f-ff8e-4431-9216-8529592c6000",
    "statusCode": 206,
    "dataSource": "imdb",
    "imdbId": "tt11378946",
    "info": {
      "title": "Michael",
      "year": "2026",
      "rated": "PG-13",
      "released": "24 Apr 2026",
      "runtime": "",
      "genre": "Biography, Drama, History",
      "director": "Antoine Fuqua",
      "writers": "John Logan",
      "actors": "Jaafar Jackson, Juliano Valdi, Tony von Halle",
      "plot": "The story of the famous musician Michael Jackson, known as the King of Pop.",
      "language": "English",
      "country": "United Kingdom",
      "poster": "https://m.media-amazon.com/images/M/MV5BZWU5ZjMxZWMtMGMxNy00NzBjLWFhNmYtZmEzNDVmMTRkZDgwXkEyXkFqcGc@._V1_SX300.jpg",
      "imdbId": "tt11378946"
    },
    "errors": [],
    "traceId": "5858a84f-ff8e-4431-9216-8529592c6000"
  }
]
`````

## File: src/asunder/asunder.module.ts
`````typescript
import { Module } from '@nestjs/common';
import { LlmBridgeController } from './llmBridge.controller';
import { LlmBridgeService } from './llmBridge.service';
⋮----
export class AsunderModule
`````

## File: src/asunder/attachment.util.ts
`````typescript
export interface ParsedDataUrl {
  mimeType: string;
  base64: string;
  buffer: Buffer;
}
⋮----
export function parseBase64DataUrl(value: string): ParsedDataUrl
⋮----
export function inferMimeFromFilename(filename: string): string | null
`````

## File: src/asunder/llmBridge.controller.spec.ts
`````typescript
import { LlmBridgeController } from './llmBridge.controller';
import { LlmBridgeService } from './llmBridge.service';
⋮----
function createResponseMock()
`````

## File: src/auth/bearer-token.guard.ts
`````typescript
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
⋮----
export class BearerTokenGuard implements CanActivate
⋮----
canActivate(ctx: ExecutionContext): boolean
⋮----
// 500: server misconfigured
`````

## File: src/common/trace-id.interceptor.ts
`````typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { TraceRequest } from './trace-id.middleware';
⋮----
export class TraceIdInterceptor implements NestInterceptor
⋮----
intercept(ctx: ExecutionContext, next: CallHandler): Observable<any>
⋮----
// don’t overwrite if already present
⋮----
// primitives / arrays => wrap so traceId is in the output
`````

## File: src/common/trace-id.middleware.ts
`````typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
⋮----
export type TraceRequest = Request & { traceId?: string };
⋮----
export class TraceIdMiddleware implements NestMiddleware
⋮----
use(req: TraceRequest, res: Response, next: NextFunction)
⋮----
function isUuid(s: string)
`````

## File: src/generate-review/dto/generate-review.dto.spec.ts
`````typescript
import { validateGenerateReviewDto } from './generate-review.dto';
⋮----
function basePayload()
`````

## File: src/generate-review/dto/generate-review.dto.ts
`````typescript
export type SpoilerMode = (typeof SPOILER_MODES)[number];
export type ReviewProvider = (typeof REVIEW_PROVIDERS)[number];
⋮----
export type ValidatedReviewTitle = {
  titleId: string;
  title?: string;
  year?: number;
  genres?: string[];
  plot?: string;
  runtimeMinutes?: number;
};
⋮----
export type ValidatedGateState = {
  canSpeak: boolean;
  reason: string | null;
  updatedAt?: string;
};
⋮----
export type ValidatedTasteAnchor = {
  anchorId: string;
  label: string;
  weight: number;
  evidence: string[];
};
⋮----
export type ValidatedUserRating = {
  titleId: string;
  rating: number;
  ratedAt?: string;
};
⋮----
export type ValidatedContradictions = {
  unresolvedCount: number;
  examples: Array<Record<string, unknown>>;
};
⋮----
export type ValidatedDrift = {
  trend?: string;
  confidence?: number;
  signals: Array<Record<string, unknown>>;
};
⋮----
export type ValidatedInteractions = {
  views: number;
  skips: number;
  saves: number;
  likes: number;
  listAdds: number;
  totalReviewInteractions: number;
};
⋮----
export type ValidatedTasteSnapshot = {
  version: string;
  signals: Record<string, unknown>;
  summary?: string;
};
⋮----
export class GenerateReviewDto
⋮----
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
⋮----
export function validateGenerateReviewDto(
  dto: GenerateReviewDto | null | undefined,
):
⋮----
function validateTitle(
  body: Record<string, unknown>,
  errors: string[],
): ValidatedReviewTitle | null
⋮----
function validateGateState(
  body: Record<string, unknown>,
  errors: string[],
): ValidatedGateState | undefined
⋮----
function validateTasteSnapshot(
  body: Record<string, unknown>,
  errors: string[],
): ValidatedTasteSnapshot | null
⋮----
function validateTasteAnchors(
  body: Record<string, unknown>,
  errors: string[],
): ValidatedTasteAnchor[] | null
⋮----
function validateUserRatings(
  body: Record<string, unknown>,
  errors: string[],
): ValidatedUserRating[] | null
⋮----
function validateContradictions(
  body: Record<string, unknown>,
  errors: string[],
): ValidatedContradictions | null
⋮----
function validateDrift(body: Record<string, unknown>, errors: string[]): ValidatedDrift | null
⋮----
function validateInteractions(
  body: Record<string, unknown>,
  errors: string[],
): ValidatedInteractions | null
⋮----
function pick(obj: Record<string, unknown>, keys: string[]): unknown
⋮----
function asObject(value: unknown): Record<string, unknown> | null
⋮----
function asTrimmedString(value: unknown): string
⋮----
function asStringArray(value: unknown): string[]
⋮----
function asInteger(value: unknown): number | null
⋮----
function nonNegativeInt(value: unknown): number | null
⋮----
function asFiniteNumber(value: unknown): number | null
`````

## File: src/generate-review/generate-review.controller.ts
`````typescript
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Request } from 'express';
⋮----
import { BearerTokenGuard } from '../auth/bearer-token.guard';
import type { TraceRequest } from '../common/trace-id.middleware';
import {
  GenerateReviewDto,
  validateGenerateReviewDto,
} from './dto/generate-review.dto';
import {
  GenerateReviewService,
  type ReviewResult,
} from './generate-review.service';
⋮----
type GenerateReviewEnvelope = {
  statusCode: number;
  errors: string[];
  latency: number;
  data: ReviewResult | null;
  traceId: string;
};
⋮----
export class GenerateReviewController
⋮----
constructor(private readonly generateReviewService: GenerateReviewService)
⋮----
async generateReview(
    @Req() req: TraceRequest,
    @Body() body: GenerateReviewDto,
): Promise<GenerateReviewEnvelope>
⋮----
private resolveTraceId(req: TraceRequest): string
⋮----
private resolveBaseUrl(req: Request): string
⋮----
private getAuthorization(req: Request): string | undefined
⋮----
private resolveUserKey(req: Request): string
`````

## File: src/generate-review/generate-review.module.ts
`````typescript
import { Module } from '@nestjs/common';
import { GenerateReviewController } from './generate-review.controller';
import { GenerateReviewService } from './generate-review.service';
⋮----
export class GenerateReviewModule
`````

## File: src/generate-review/generate-review.service.spec.ts
`````typescript
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
⋮----
import { GenerateReviewService } from './generate-review.service';
import type { ValidatedGenerateReviewInput } from './dto/generate-review.dto';
⋮----
function jsonResponse(status: number, body: unknown): Response
`````

## File: src/generate-review/generate-review.service.ts
`````typescript
import { Injectable } from '@nestjs/common';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
⋮----
import type {
  ReviewProvider,
  SpoilerMode,
  ValidatedGateState,
  ValidatedGenerateReviewInput,
  ValidatedReviewTitle,
} from './dto/generate-review.dto';
⋮----
type ReviewDecisionType = (typeof REVIEW_DECISIONS)[number];
⋮----
type ReviewGate = {
  canSpeak: boolean;
  reason: string | null;
  updatedAt?: string;
};
⋮----
type TitleEvidence = {
  titleId: string;
  title: string;
  year: number | null;
  genres: string[];
  plot: string;
  runtimeMinutes: number | null;
};
⋮----
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
⋮----
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
⋮----
type ReviewStore = {
  reviewGates: Record<string, ReviewGate>;
  generatedReviews: GeneratedReviewRecord[];
};
⋮----
type LlmRouterResponse = {
  provider: ReviewProvider | null;
  outputText: string;
};
⋮----
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
⋮----
export type GenerateReviewContext = {
  traceId: string;
  authorization?: string;
  baseUrl: string;
  userKey: string;
};
⋮----
export type GenerateReviewServiceResult = {
  statusCode: number;
  errors: string[];
  data: ReviewResult | null;
};
⋮----
class ServiceError extends Error
⋮----
constructor(
    readonly statusCode: number,
    readonly publicMessage: string,
)
⋮----
export class GenerateReviewService
⋮----
async generateReview(
    input: ValidatedGenerateReviewInput,
    context: GenerateReviewContext,
): Promise<GenerateReviewServiceResult>
⋮----
private buildPrompts(evidence: TasteEvidence):
⋮----
private buildTasteEvidence(
    input: ValidatedGenerateReviewInput,
    title: TitleEvidence,
    gate: ReviewGate,
): TasteEvidence
⋮----
private resolveGate(
    store: ReviewStore,
    userKey: string,
    inputGate: ValidatedGateState | undefined,
): ReviewGate
⋮----
private async resolveTitleEvidence(
    inputTitle: ValidatedReviewTitle,
    context: GenerateReviewContext,
): Promise<TitleEvidence>
⋮----
private async loadTitleEvidence(titleId: string, context: GenerateReviewContext): Promise<TitleEvidence>
⋮----
private async callLlmRouter(
    payload: {
      provider?: ReviewProvider;
      input: string;
      system?: string;
      metadata: Record<string, unknown>;
    },
    context: GenerateReviewContext,
): Promise<LlmRouterResponse>
⋮----
private parseModelResult(outputText: string): ReviewResult
⋮----
private extractJsonPayload(raw: string): string
⋮----
private findCachedReview(
    store: ReviewStore,
    userKey: string,
    titleId: string,
    spoilerMode: SpoilerMode,
): ReviewResult | null
⋮----
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
): Promise<void>
⋮----
private async loadStore(): Promise<ReviewStore>
⋮----
private normalizeGeneratedReview(item: unknown): GeneratedReviewRecord | null
⋮----
private normalizeReviewResult(input: unknown): ReviewResult | null
⋮----
private async saveStore(store: ReviewStore): Promise<void>
⋮----
private storePath(): string
⋮----
private readStatusCode(payload: Record<string, unknown> | null, fallback: number): number
⋮----
private baseUrl(raw: string): string
⋮----
private parseIntLike(value: unknown): number | null
⋮----
private splitCsv(value: unknown): string[]
⋮----
private asOptionalString(value: unknown): string | null
⋮----
private asNumber(value: unknown): number | null
⋮----
private asObject(value: unknown): Record<string, any> | null
⋮----
private asStringArray(value: unknown): string[]
⋮----
private wordCount(text: string): number
⋮----
private async readJsonSafe(response: Response): Promise<Record<string, any> | null>
`````

## File: src/justus/filmTrailer.controller.ts
`````typescript
import { All, Controller, Get, Options, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { FilmTrailerService } from './filmTrailer.service';
⋮----
export class FilmTrailerController
⋮----
constructor(private readonly filmTrailerService: FilmTrailerService)
⋮----
options(@Req() req: Request, @Res() res: Response)
⋮----
async filmTrailer(
    @Req() req: Request,
    @Res() res: Response,
    @Query() queryParams: Record<string, string | string[] | undefined>,
)
⋮----
methodNotAllowed(@Req() req: Request, @Res() res: Response)
⋮----
private resolveTraceId(req: Request): string
⋮----
private isAuthorized(req: Request): boolean
`````

## File: src/justus/filmTrailer.service.ts
`````typescript
import { Injectable } from '@nestjs/common';
⋮----
type FilmTrailerVideo = {
  videoId: string;
  title: string;
  description: string;
  thumbnails: unknown;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
};
⋮----
type FilmTrailerBody = {
  requestId: string;
  statusCode: number;
  dataSource: 'youtube';
  query?: {
    q: string;
    maxResults: number;
  };
  videos: FilmTrailerVideo[];
  videoCount: number;
  errors: string[];
  upstreamBody?: string;
};
⋮----
export type FilmTrailerResult = {
  statusCode: number;
  body: FilmTrailerBody;
};
⋮----
export class FilmTrailerService
⋮----
async search(
    traceId: string,
    rawParams: Record<string, string | string[] | undefined>,
): Promise<FilmTrailerResult>
⋮----
private pickQuery(rawParams: Record<string, string | string[] | undefined>): string
⋮----
private parseMaxResults(value: string | string[] | undefined): number
⋮----
private buildYoutubeUrl(query: string, maxResults: number, apiKey: string): string
⋮----
private extractVideos(items: unknown): FilmTrailerVideo[]
⋮----
private firstValue(value: string | string[] | undefined): string
⋮----
private buildResult(statusCode: number, body: FilmTrailerBody): FilmTrailerResult
`````

## File: src/justus/justus.module.ts
`````typescript
import { Module } from '@nestjs/common';
import { TitleSearchController } from './titleSearch.controller';
import { TitleDetailController } from './titleDetail.controller';
import { FilmTrailerController } from './filmTrailer.controller';
import { FilmTrailerService } from './filmTrailer.service';
import { LlmRouterController } from './llmRouter.controller';
import { LlmRouterService } from './llmRouter.service';
⋮----
// NEW
import { TrailersController } from './trailers.controller';
⋮----
TrailersController, // NEW
⋮----
export class JustUsModule
`````

## File: src/justus/llmRouter.controller.ts
`````typescript
import { All, Controller, Options, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { BearerTokenGuard } from '../auth/bearer-token.guard';
import { LlmRouterService } from './llmRouter.service';
⋮----
export class LlmRouterController
⋮----
constructor(private readonly llmRouterService: LlmRouterService)
⋮----
options(@Req() req: Request, @Res() res: Response)
⋮----
async post(@Req() req: Request, @Res() res: Response)
⋮----
methodNotAllowed(@Req() req: Request, @Res() res: Response)
⋮----
private resolveTraceId(req: Request): string
⋮----
private toBodyRaw(body: unknown): string | undefined
`````

## File: src/justus/llmRouter.service.ts
`````typescript
import { Injectable } from '@nestjs/common';
⋮----
type LlmProvider = 'deepseek' | 'openai';
⋮----
type RouterPayload = {
  provider?: unknown;
  input?: unknown;
  system?: unknown;
  metadata?: unknown;
};
⋮----
type NormalizedRequest = {
  provider: LlmProvider | null;
  input: string;
  system: string | null;
  metadata: Record<string, unknown> | null;
};
⋮----
type ProviderResult = {
  provider: LlmProvider;
  model: string;
  trace_id: string;
  output_text: string;
  raw_provider_meta: {
    status: number;
    headers: {
      'x-request-id': string | null;
    };
    body: unknown;
  };
};
⋮----
type RouteSuccess = {
  statusCode: number;
  body: ProviderResult;
};
⋮----
type RouteFailure = {
  statusCode: number;
  body: {
    errors: string[];
    trace_id: string;
    details?: unknown;
  };
};
⋮----
export type LlmRouterResult = RouteSuccess | RouteFailure;
⋮----
class HttpError extends Error
⋮----
constructor(
    readonly statusCode: number,
    message: string,
    readonly details: unknown = null,
)
⋮----
export class LlmRouterService
⋮----
async route(rawBody: string | undefined, traceId: string): Promise<LlmRouterResult>
⋮----
// no-op: fallback to OpenAI
⋮----
private parseJsonBody(rawBody: string | undefined): RouterPayload
⋮----
private validateRequestPayload(payload: RouterPayload): NormalizedRequest
⋮----
private async callDeepseek(request: NormalizedRequest, traceId: string): Promise<ProviderResult>
⋮----
private async callOpenAi(request: NormalizedRequest, traceId: string): Promise<ProviderResult>
⋮----
private getDeepseekConfig()
⋮----
private getOpenAiConfig()
⋮----
private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeoutMs: number,
): Promise<Response>
⋮----
private async readJsonSafe(
    response: Response,
): Promise<
⋮----
private normalizeProviderResponse(
    provider: LlmProvider,
    response: Response,
    body: Record<string, unknown>,
)
⋮----
private extractTextFromProviderBody(body: Record<string, unknown> | null): string | null
⋮----
private parseNumber(value: string | undefined, fallback: number): number
⋮----
private parseInteger(value: string | undefined, fallback: number): number
`````

## File: src/kiaspora/ffmpeg.ts
`````typescript
import { spawn } from 'node:child_process';
⋮----
type TranscodeArgs = {
  input: string;
  output: string;
  args: string[];
};
⋮----
export async function transcode(job: TranscodeArgs): Promise<void>
`````

## File: src/kiaspora/googleSpeechToText.ts
`````typescript
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
⋮----
import { transcode } from './ffmpeg';
⋮----
type RouterBody = {
  languageCode?: unknown; // e.g. "zh-CN" (primary)
  altLanguageCodes?: unknown; // e.g. ["en-US","zh-CN"] or "en-US,zh-CN"
  languageCodes?: unknown; // e.g. ["en-US","zh-CN"] (first primary, rest alt)
  model?: unknown;
  mimeType?: unknown; // e.g. "audio/flac" | "audio/wav"
  base64Audio?: unknown;
  sampleRateHertz?: unknown;
};
⋮----
languageCode?: unknown; // e.g. "zh-CN" (primary)
altLanguageCodes?: unknown; // e.g. ["en-US","zh-CN"] or "en-US,zh-CN"
languageCodes?: unknown; // e.g. ["en-US","zh-CN"] (first primary, rest alt)
⋮----
mimeType?: unknown; // e.g. "audio/flac" | "audio/wav"
⋮----
type ProviderOut = {
  model: string;
  latency_ms: number;
  text: string;
  traceId: string;
};
⋮----
function requireEnv(name: string): string
⋮----
function asString(v: unknown): string | undefined
⋮----
function asStringArray(v: unknown): string[] | undefined
⋮----
function asNumber(v: unknown): number | undefined
⋮----
function stripDataUrlToBase64(maybeDataUrl: string): string
⋮----
function normalizeMimeType(input?: string): string | undefined
⋮----
async function transcodeToLinear16Wav(inputBytes: Buffer): Promise<Buffer>
⋮----
/**
 * Accepts:
 * - ["en-US","zh-CN"]
 * - "en-US, zh-CN"
 * - "en-US"
 */
function parseLanguageList(v: unknown): string[]
⋮----
/**
 * Very strict and predictable validation:
 * - Keeps only BCP-47-ish tags like en-US, zh-CN, es-419.
 * - Removes duplicates (case-insensitive compare).
 * - Hard cap: 1 primary + up to 2 alternatives (max 3 total)
 */
function normalizeLanguages(input: {
  languageCode?: string;
  languageCodes?: unknown;
  altLanguageCodes?: unknown;
}):
⋮----
// languageCodes takes precedence as the “full set”
⋮----
// Default if nothing provided
⋮----
// Validate tag format (simple, deterministic)
const isValid = (tag: string) => /^[a-zA-Z]
⋮----
// Deduplicate case-insensitively while preserving order
⋮----
// Hard cap: 3 total languages (1 primary + 2 alternatives)
⋮----
/**
 * Core runner: returns stable shape.
 * Uses REST Speech API (API key) instead of @google-cloud/speech ADC.
 */
export async function runGoogleSpeechToTextCore(params: {
  body: RouterBody;
  traceId: string;
  audioBase64?: string; // router can pass this from multipart
}): Promise<ProviderOut>
⋮----
audioBase64?: string; // router can pass this from multipart
⋮----
// Multilingual selection: primary + alternatives
⋮----
// Build config + audio per mimeType logic (same intent as old provider)
⋮----
// Optional model passthrough (same as old provider)
`````

## File: src/kiaspora/imageScan.controller.ts
`````typescript
import { Body, Controller, HttpCode, Options, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
⋮----
import { BearerTokenGuard } from '../auth/bearer-token.guard';
import { ImageScanService } from './imageScan.service';
⋮----
type RouterBody = {
  aiProvider?: unknown;
  base64Image?: unknown;
  mimeType?: unknown;
  customPrompt?: unknown;
  traceId?: unknown;
  imageUrl?: unknown;
};
⋮----
function isMultipart(req: Request): boolean
⋮----
export class ImageScanController
⋮----
constructor(private readonly svc: ImageScanService)
⋮----
// Keep preflight behavior compatible (empty 204).
⋮----
async options(): Promise<void>
⋮----
async handler(@Req() req: Request, @Body() body: RouterBody)
⋮----
// Multipart bodies are not JSON-parsed; parse from stream instead.
⋮----
// Outputs must remain the same as the Cloud Function (no envelope).
`````

## File: src/kiaspora/imageScan.module.ts
`````typescript
import { Module } from '@nestjs/common';
import { ImageScanController } from './imageScan.controller';
import { ImageScanService } from './imageScan.service';
⋮----
export class ImageScanModule
`````

## File: src/kiaspora/imageScan.service.ts
`````typescript
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import Busboy from 'busboy';
⋮----
type RouterBody = {
  aiProvider?: unknown;
  base64Image?: unknown;
  mimeType?: unknown;
  customPrompt?: unknown;
  traceId?: unknown;
  imageUrl?: unknown;
};
⋮----
const MULTIPART_MAX_BYTES = 12 * 1024 * 1024; // 12MB
⋮----
class HttpError extends Error
⋮----
constructor(public readonly statusCode: number, message: string)
⋮----
function normalizeAiProvider(v: unknown): 'openai' | 'google' | null
⋮----
function pickTraceId(req: Request, body?: any): string
⋮----
// per tmpl-api-pattern.md: middleware attaches req.traceId
⋮----
// keep same default as function (it used "router-trace" if not string)
⋮----
function requireEnv(name: string): string
⋮----
export class ImageScanService
⋮----
parseJsonBody(raw: any): RouterBody
⋮----
// In Nest, JSON is already parsed, but keep parity with the Functions parser:
⋮----
/**
   * Multipart parse (Busboy) similar to Functions version.
   * - Supports file fields: "image" or "file"
   * - Supports imageUrl-only payloads
   * - Enforces 12MB limit
   */
async parseMultipart(req: Request): Promise<RouterBody>
⋮----
// normalize file -> base64 data URL
⋮----
// In Nest/Express on Railway, stream is usually available; if some middleware
// has already buffered, this supports Buffer raw bodies as well.
⋮----
/**
   * Main router logic.
   * Returns stable response shape:
   * { model, aiProvider, latency_ms, translation, traceId }
   */
async run(rawBody: RouterBody, req: Request): Promise<
⋮----
/**
   * OpenAI image scan core (replaces functions/src/providers/openaiImageScan).
   * Contract matches:
   * { model, latency_ms, translation, traceId }
   */
private async runOpenaiImageScanCore(args:
⋮----
// Use Responses API (matches your translationChat OpenAI usage style)
⋮----
// OpenAI accepts https URL or data URL
⋮----
// Same “buildAnswer” logic used in translationChat
⋮----
/**
   * Google Vision OCR core (replaces functions/src/providers/googleVisionOcrScan).
   * Contract matches:
   * { model, latency_ms, translation, traceId }
   */
private async runGoogleVisionOcrCore(args:
⋮----
// Vision API expects either:
// - image.source.imageUri
// - or image.content (base64, without the data: prefix)
`````

## File: src/kiaspora/promptConfig.controller.ts
`````typescript
import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  Options,
  HttpCode,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
⋮----
import { BearerTokenGuard } from '../auth/bearer-token.guard';
import { PromptConfigService } from './promptConfig.service';
⋮----
type ErrorBody = { error: string };
⋮----
export class PromptConfigController
⋮----
constructor(private readonly svc: PromptConfigService)
⋮----
private getTraceId(req: Request)
⋮----
private setup(res: Response, traceId: string)
⋮----
private send(res: Response, status: number, body: any)
⋮----
private sendError(res: Response, status: number, message: string)
⋮----
async options(@Req() req: Request, @Res() res: Response)
⋮----
async get(@Req() req: Request, @Res() res: Response)
⋮----
async post(@Req() req: Request, @Res() res: Response)
⋮----
async put(@Req() req: Request, @Res() res: Response)
⋮----
async patch(@Req() req: Request, @Res() res: Response)
⋮----
async del(@Req() req: Request, @Res() res: Response)
`````

## File: src/kiaspora/promptConfig.module.ts
`````typescript
import { Module } from '@nestjs/common';
import { PromptConfigController } from './promptConfig.controller';
import { PromptConfigService } from './promptConfig.service';
⋮----
export class PromptConfigModule
`````

## File: src/kiaspora/promptConfig.service.ts
`````typescript
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { Pool } from 'pg';
⋮----
class HttpError extends Error
⋮----
constructor(public readonly status: number, message: string)
⋮----
function isNonEmptyString(x: any): x is string
⋮----
function requireEnv(name: string): string
⋮----
function parsePromptName(promptNameRaw: any, allowDefault = true)
⋮----
function parseIncludeGlobal(req: Request)
⋮----
function parsePromptId(req: Request, body: any)
⋮----
function pick(body: any, ...keys: string[])
⋮----
/* -------------------------------------------------------------------------- */
/* neon pool (lazy singleton)                                                 */
/* -------------------------------------------------------------------------- */
⋮----
function getPool(): Pool
⋮----
export class PromptConfigService
⋮----
async handleGet(req: Request)
⋮----
// Keep same constraint as the original code comment (`in`/lists are bounded).
⋮----
async handlePost(rawBody: any)
⋮----
async handleUpdate(req: Request)
⋮----
// allow partial updates
⋮----
// build dynamic SET list safely
⋮----
async handleDelete(req: Request)
⋮----
// soft delete
`````

## File: src/kiaspora/speechToText.controller.ts
`````typescript
import { Body, Controller, HttpCode, Options, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
⋮----
import { BearerTokenGuard } from '../auth/bearer-token.guard';
import { SpeechToTextService } from './speechToText.service';
⋮----
type RouterBody = {
  languageCode?: unknown;
  altLanguageCodes?: unknown;
  languageCodes?: unknown;
  model?: unknown;
  mimeType?: unknown;
  base64Audio?: unknown; // JSON path
  sampleRateHertz?: unknown;
  traceId?: unknown;
};
⋮----
base64Audio?: unknown; // JSON path
⋮----
function isMultipart(req: Request): boolean
⋮----
export class SpeechToTextController
⋮----
constructor(private readonly svc: SpeechToTextService)
⋮----
// Keep preflight behavior compatible (empty 204).
⋮----
async options(): Promise<void>
⋮----
async handler(@Req() req: Request, @Body() body: RouterBody)
⋮----
// Multipart bodies are not JSON-parsed; parse from stream instead.
⋮----
// Outputs must remain the same as the Cloud Function (no envelope).
`````

## File: src/kiaspora/speechToText.module.ts
`````typescript
import { Module } from '@nestjs/common';
import { SpeechToTextController } from './speechToText.controller';
import { SpeechToTextService } from './speechToText.service';
⋮----
export class SpeechToTextModule
`````

## File: src/kiaspora/speechToText.service.ts
`````typescript
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import Busboy from 'busboy';
⋮----
import { runGoogleSpeechToTextCore } from './googleSpeechToText';
⋮----
type RouterBody = {
  languageCode?: unknown;
  altLanguageCodes?: unknown;
  languageCodes?: unknown;
  model?: unknown;
  mimeType?: unknown;
  base64Audio?: unknown;
  sampleRateHertz?: unknown;
  traceId?: unknown;
};
⋮----
const MULTIPART_MAX_BYTES = 20 * 1024 * 1024; // 20MB
⋮----
class HttpError extends Error
⋮----
constructor(public readonly statusCode: number, message: string)
⋮----
function pickTraceId(req: Request, body?: any): string
⋮----
// per tmpl-api-pattern.md: middleware attaches req.traceId
⋮----
// IMPORTANT: Cloud Function default for this route
⋮----
export class SpeechToTextService
⋮----
parseJsonBody(raw: any): RouterBody
⋮----
// In Nest, JSON is already parsed, but keep parity with the Functions parser:
⋮----
/**
   * Multipart parsing equivalent to Cloud Function:
   * - Accepts file field: "audio" or "file"
   * - Enforces 20MB limit
   * - Produces audioBase64 as data:<mime>;base64,<...>
   */
async parseMultipart(req: Request): Promise<
⋮----
// Same rawBody fallback pattern used elsewhere in this repo.
⋮----
/**
   * Main router logic.
   * Returns stable response shape (must match Cloud Function):
   * { model, aiProvider, latency_ms, text, traceId }
   */
async run(rawBody: RouterBody, req: Request, audioBase64?: string): Promise<
`````

## File: src/kiaspora/translationChat.controller.ts
`````typescript
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { randomUUID } from 'crypto';
⋮----
import { BearerTokenGuard } from '../auth/bearer-token.guard';
import { TranslationChatService } from './translationChat.service';
⋮----
type TranslationChatBody = {
  // legacy field (kept)
  aiProvider?: string | null;
  // new field (matches your translationRouter contract)
  provider?: string | null;

  messages?: unknown;
  sourceLang?: unknown;
  targetLang?: unknown;
  context?: unknown;
  traceId?: unknown;
  customPrompt?: unknown;
};
⋮----
// legacy field (kept)
⋮----
// new field (matches your translationRouter contract)
⋮----
function getTraceId(req: Request, body?: any): string
⋮----
// Prefer platform middleware if present (tmpl-api-pattern.md suggests req.traceId)
⋮----
export class TranslationChatController
⋮----
constructor(private readonly svc: TranslationChatService)
⋮----
// PATH REQUIRED: /api/kiaspora/translationChat
⋮----
async handler(@Req() req: Request, @Body() body: TranslationChatBody)
⋮----
// Keep output contract EXACTLY like the Cloud Function:
// { reply, traceId, aiProvider, latency_ms }
`````

## File: src/kiaspora/translationChat.module.ts
`````typescript
import { Module } from '@nestjs/common';
import { TranslationChatController } from './translationChat.controller';
import { TranslationChatService } from './translationChat.service';
⋮----
export class TranslationChatModule
`````

## File: src/kiaspora/translationChat.service.ts
`````typescript
import { Injectable } from '@nestjs/common';
⋮----
type ChatProvider = 'deepseek' | 'openai' | 'groq';
⋮----
type TranslationChatBody = {
  aiProvider?: string | null; // legacy
  provider?: string | null;   // new
  messages?: unknown;
  sourceLang?: unknown;
  targetLang?: unknown;
  context?: unknown;
  traceId?: unknown;
  customPrompt?: unknown;
};
⋮----
aiProvider?: string | null; // legacy
provider?: string | null;   // new
⋮----
class HttpError extends Error
⋮----
constructor(public readonly statusCode: number, message: string)
⋮----
function requireEnv(name: string, forMsg: string): string
⋮----
function parseBody(raw: any): TranslationChatBody
⋮----
// Nest will already parse JSON, but keep parity with the Cloud Function:
⋮----
function validateBody(payload: TranslationChatBody)
⋮----
// provider selection precedence:
// 1) provider (new)
// 2) aiProvider (legacy)
⋮----
function buildAnswer(body: any): string
⋮----
export class TranslationChatService
⋮----
async run(rawBody: TranslationChatBody, traceId: string)
⋮----
// Keep EXACT output shape
⋮----
// Keep error semantics compatible:
// - preserve 400/405 style errors as HttpError where possible
// - otherwise 500
// NOTE: If your project uses a global exception filter, this can be simplified.
⋮----
// Cloud Function used sendError(); without that infra here, throw HttpError
// and let Nest global filters map it.
⋮----
// Keep log payload similar (no firebase uid here)
⋮----
private async callProvider(args: {
    aiProvider: ChatProvider;
    messages: any[];
    customPrompt: string;
    traceId: string;
})
⋮----
// Groq: preserve the same “joined messages” adaptation
⋮----
// IMPORTANT: if your existing NestJS code already has a groq service,
// swap this section to call it. For now this mirrors the function behavior
// without importing firebase code.
⋮----
// OpenAI / DeepSeek (same as function)
`````

## File: src/kiaspora/translationRouter.controller.ts
`````typescript
import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { BearerTokenGuard } from '../auth/bearer-token.guard';
import { TranslationRouterService } from './translationRouter.service';
⋮----
type ErrorBody = { error: string; code?: string; traceId?: string; details?: any };
⋮----
export class TranslationRouterController
⋮----
constructor(private readonly svc: TranslationRouterService)
⋮----
async translationRouter(@Req() req: Request, @Res() res: Response)
⋮----
// Preflight
`````

## File: src/meta/meta.controller.spec.ts
`````typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MetaController } from './meta.controller';
`````

## File: src/app.controller.spec.ts
`````typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
`````

## File: src/app.controller.ts
`````typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
⋮----
export class AppController
⋮----
constructor(private readonly appService: AppService)
⋮----
getHello(): string
`````

## File: src/app.service.ts
`````typescript
import { Injectable } from '@nestjs/common';
⋮----
export class AppService
⋮----
getHello(): string
`````

## File: test/app.e2e-spec.ts
`````typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
`````

## File: test/jest-e2e.json
`````json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
`````

## File: .prettierrc
`````
{
  "singleQuote": true,
  "trailingComma": "all"
}
`````

## File: AGENTS.md
`````markdown
## MANDATORY: Use td for Task Management

You must run td usage --new-session at conversation start (or after /clear) to see current work.
Use td usage -q for subsequent reads.
`````

## File: app.module.ts
`````typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
⋮----
export class AppModule
`````

## File: eslint.config.mjs
`````javascript
// @ts-check
`````

## File: nest-cli.json
`````json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
`````

## File: README.md
`````markdown
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
`````

## File: tsconfig.build.json
`````json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
`````

## File: tsconfig.json
`````json
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "resolvePackageJsonExports": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2023",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "noFallthroughCasesInSwitch": false
  }
}
`````

## File: src/justus/titleDetail.controller.ts
`````typescript
import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { BearerTokenGuard } from '../auth/bearer-token.guard';
⋮----
type TitleDetailInfo = {
  title: string;
  year: string;
  rated: string;
  released: string;
  runtime: string;
  genre: string;
  director: string;
  writers: string;
  actors: string;
  plot: string;
  language: string;
  country: string;
  poster: string;
  imdbId: string;
};
⋮----
function makeError({
  source,
  message,
  code,
  details,
}: {
  source: string;
  message: string;
  code?: any;
  details?: any;
})
⋮----
function truncate(s: any, n = 800)
⋮----
function extractErrMessage(err: any)
⋮----
function stringifyError(err: any)
⋮----
function cleanText(value: any): string
⋮----
function parseRuntimeMinutes(runtime: any): string
⋮----
function firstCommaValue(value: any): string
⋮----
function toTitleDetailInfo(omdb: any, imdbId: string): TitleDetailInfo
⋮----
function hasPartialInfo(info: TitleDetailInfo)
⋮----
function hasRequiredTitleYear(info: TitleDetailInfo)
⋮----
function hasAnyInfoValue(info: TitleDetailInfo)
⋮----
function toTitleDetailInfoFromFallback(raw: any, imdbId: string): TitleDetailInfo
⋮----
function buildLocalBaseUrl(req: Request)
⋮----
export class TitleDetailController
⋮----
async titleDetail(
    @Req() req: Request,
    @Res() res: Response,
    @Query('imdbId') imdbIdRaw: string | undefined,
)
⋮----
// Fallback: /api/parse/imdbDetail?imdbId=...
`````

## File: src/kiaspora/translationRouter.service.ts
`````typescript
import { Injectable } from '@nestjs/common';
⋮----
type Provider = 'deepseek' | 'groq' | 'openai';
⋮----
type NormalizedRequest = {
  provider: Provider | null;
  sourceText: string;
  sourceLang: string; // default "auto"
  targetLang: string;
  context: string | null; // merged context + userMessage
  customPrompt: string | null;
};
⋮----
sourceLang: string; // default "auto"
⋮----
context: string | null; // merged context + userMessage
⋮----
type ProviderResult200 = {
  translation: string;              // canonical JSON string
  detected_source_lang: string;     // best-effort, else "auto"
  provider: Provider;               // who produced it
  latency_ms: number;
  raw_provider_meta: any;           // raw-ish metadata for debugging
};
⋮----
translation: string;              // canonical JSON string
detected_source_lang: string;     // best-effort, else "auto"
provider: Provider;               // who produced it
⋮----
raw_provider_meta: any;           // raw-ish metadata for debugging
⋮----
class HttpError extends Error
⋮----
constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly details?: any,
)
⋮----
function isNonEmptyString(x: any): x is string
⋮----
function pickFirstEnv(...names: string[])
⋮----
// Accept both camelCase and snake_case without breaking older clients
function getBodyField(body: any, camel: string, snake: string)
⋮----
function normalizeProvider(raw: any): Provider | null
⋮----
function mergeContext(rawContext: any, rawUserMessage: any): string | null
⋮----
/**
 * Turn model output into a single JSON object string (no fences).
 * - If output contains code fences, strip them.
 * - If it’s parseable JSON, re-stringify compactly.
 * - Otherwise wrap into the required keys (best-effort).
 */
function toCanonicalTranslationJsonString(raw: string, sourceText: string): string
⋮----
// Try parse JSON as-is
⋮----
// Keep whatever keys exist, but ensure required keys are present
⋮----
// fall through
⋮----
// Best-effort wrapper
⋮----
export class TranslationRouterService
⋮----
async handle(body: any, traceId: string): Promise<ProviderResult200>
⋮----
// Forced provider (no fallback) — matches Cloud Function behavior :contentReference[oaicite:4]{index=4}
⋮----
// Default: DeepSeek → Groq → OpenAI :contentReference[oaicite:5]{index=5}
⋮----
// swallow and fall through
⋮----
// swallow and fall through
⋮----
private validate(body: any): NormalizedRequest
⋮----
// NOTE: support both legacy snake_case and newer camelCase
⋮----
// Preserve contract: merge context + userMessage :contentReference[oaicite:6]{index=6}
⋮----
// ---------- Providers ----------
⋮----
private async callOpenAI(
    payload: { sourceText: string; sourceLang: string; targetLang: string; context: string | null; customPrompt: string | null },
    traceId: string,
): Promise<ProviderResult200>
⋮----
// IMPORTANT: use the correct env var name
⋮----
'OPENAI_KIA_API_KEY',          // ✅ correct
'OPENAI_API_KEY',              // fallback if used elsewhere
'OPENAI_KIASPORA_API_KEY',     // legacy safety net
⋮----
// non-json upstream
⋮----
private async callDeepSeek(
    payload: { sourceText: string; sourceLang: string; targetLang: string; context: string | null; customPrompt: string | null },
    traceId: string,
): Promise<ProviderResult200>
⋮----
private async callGroq(
    payload: { sourceText: string; sourceLang: string; targetLang: string; context: string | null; customPrompt: string | null },
    traceId: string,
): Promise<ProviderResult200>
`````

## File: src/meta/meta.controller.ts
`````typescript
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
⋮----
export class MetaController
⋮----
status()
⋮----
about()
`````

## File: src/parse/imdb-detail.controller.ts
`````typescript
// src/parse/imdb-detail.controller.ts
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
⋮----
import type { Element } from 'domhandler';
⋮----
import { BearerTokenGuard } from '../auth/bearer-token.guard';
import type { TraceRequest } from '../common/trace-id.middleware';
⋮----
type ParseHtmlResponse = {
  statusCode: number;
  url: string;
  filePath: string | null;
  errors: string[];
  latency: number;
  size: number;
};
⋮----
type ImdbDetailResponse = {
  requestId: string;
  statusCode: number;
  dataSource: 'imdb';
  imdbId: string;
  info: {
    title: string;
    year: string;
    rated: string;
    released: string;
    runtime: string; // minutes
    genre: string;
    director: string;
    writers: string;
    actors: string;
    plot: string;
    language: string;
    country: string;
    poster: string;
    imdbId: string;
  };
  errors: string[];
};
⋮----
runtime: string; // minutes
⋮----
function parseRuntimeToMinutes(runtimeText: string): string
⋮----
// runtimeText examples: "1h", "1h 36m", "96m"
⋮----
function usDateToDMY(s: string): string
⋮----
// input: "May 22, 2025 (United States)" or "May 22, 2025"
⋮----
function isoDateToDMY(s: string): string
⋮----
// input: "2024-10-04"
⋮----
function isoDurationToRuntimeText(isoDuration: string): string
⋮----
// input examples: "PT1H43M", "PT103M", "PT2H"
⋮----
function textOf($: cheerio.CheerioAPI, sel: string): string
⋮----
function firstLinkTextByHrefIncludes($: cheerio.CheerioAPI, hrefIncludes: string): string
⋮----
function linkTextsByHrefIncludes($: cheerio.CheerioAPI, hrefIncludes: string): string[]
⋮----
type ImdbJsonLd = {
  genre?: string[] | string;
  datePublished?: string;
  duration?: string;
  description?: string;
  image?: string;
  contentRating?: string;
};
⋮----
function firstMovieJsonLd($: cheerio.CheerioAPI): ImdbJsonLd | null
⋮----
const toList = (node: any): any[] =>
⋮----
const isMovieType = (t: unknown): boolean =>
⋮----
// ignore malformed JSON-LD blocks
⋮----
function listLinkTexts($root: cheerio.Cheerio<Element>, $: cheerio.CheerioAPI): string[]
⋮----
function findPeopleByLabel(
  $: cheerio.CheerioAPI,
  label: string,
): string
⋮----
// In title-pc-list, label is usually a <span> with exact text like "Director" or "Writer"
⋮----
function findStars($: cheerio.CheerioAPI): string
⋮----
// Stars label is an <a> with text "Stars" (not a span label)
⋮----
export class ImdbDetailController
⋮----
async imdbDetail(@Query('imdbId') imdbIdRaw: string | undefined, @Req() req: TraceRequest)
⋮----
// Build local base URL (supports proxies)
⋮----
// ---- hero: title / year / rated / runtime ----
⋮----
// ---- genres (Storyline section) ----
⋮----
// ---- plot (Storyline section) ----
⋮----
// ---- details: release / country / language ----
⋮----
// ---- people: director/creator, writers, actors ----
⋮----
// IMDB sometimes uses Writer singular; return joined names regardless.
⋮----
// ---- poster ----
⋮----
// ---- enforce “must be found in HTML” ----
⋮----
const require = (k: string, v: string) =>
⋮----
statusCode: errors.length ? 206 : 200, // partial content if some fields missing
⋮----
// Best-effort cleanup; parsing result is still returned.
`````

## File: src/parse/imdb-search.controller.ts
`````typescript
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { BearerTokenGuard } from '../auth/bearer-token.guard';
import type { TraceRequest } from '../common/trace-id.middleware';
⋮----
type ParseHtmlResponse = {
  statusCode: number;
  url: string;
  filePath: string | null;
  errors: string[];
  latency: number;
  size: number;
};
⋮----
type ImdbSearchItem = {
  imdbId: string;
  title: string;
  year: number;
};
⋮----
type ImdbSearchResponse = {
  statusCode: number;
  query: string;
  url: string;
  filePath: string | null;
  errors: string[];
  latency: number;
  size: number;
  results: ImdbSearchItem[];
};
⋮----
function minimalEntityDecode(s: string): string
⋮----
function parseImdbFindHtml(html: string): ImdbSearchItem[]
⋮----
// Case-sensitive, dot matches newlines, global scan, lazy separators
⋮----
export class ImdbSearchController
⋮----
async imdbSearch(@Query('query') query: string | undefined, @Req() req: TraceRequest)
⋮----
// Call the existing endpoint so it writes temp/<host>-<hash>.html
⋮----
// Safety: only read from temp/
`````

## File: src/justus/titleSearch.controller.ts
`````typescript
import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { BearerTokenGuard } from '../auth/bearer-token.guard';
⋮----
function makeError({
  source,
  message,
  code,
  details,
}: {
  source: string;
  message: string;
  code?: any;
  details?: any;
})
⋮----
function toCamelKey(key: string)
⋮----
function camelizeValue(value: any): any
⋮----
function parseYearValue(raw: any): number | null
⋮----
// OMDb can return ranges like "2024-", "2024–", or "2024-2026".
⋮----
function toCanonicalSearchItem(raw: any):
⋮----
function normalizeItemsToCanonical(items: any): Array<
⋮----
function truncate(s: any, n = 800)
⋮----
function extractErrMessage(err: any)
⋮----
function stringifyError(err: any)
⋮----
function parseTitleWithOptionalYearSuffix(raw: string)
⋮----
export class TitleSearchController
⋮----
async titleSearch(@Req() req: Request, @Res() res: Response, @Query() _qp: any)
⋮----
// Parse query string similar to Netlify event.rawQuery
⋮----
// Forward everything except dataSource; normalize search params for CF worker
⋮----
async function fetchOmdbFallback()
⋮----
// 1) Primary upstream: CF Worker IMDb search proxy
⋮----
// 2) Fallback: OMDb if upstream returns no items and query exists
`````

## File: src/justus/trailers.controller.ts
`````typescript
// src/justus/trailers.controller.ts
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { BearerTokenGuard } from '../auth/bearer-token.guard';
import type { Request } from 'express';
⋮----
type TraceRequest = Request & { traceId?: string };
⋮----
type TitleDetailBody = {
  requestId: string;
  statusCode: number; // 200 | 206 etc
  dataSource: 'imdb' | string;
  imdbId: string;
  info: any;
  errors: any[];
  traceId?: string;
  timestamp?: string;
};
⋮----
statusCode: number; // 200 | 206 etc
⋮----
type ApiResponse<T> = {
  statusCode: number;
  errors: string[];
  latency: number;
  size?: number;
  data: T;
};
⋮----
function clampInt(n: number, min: number, max: number)
⋮----
function parseLimit(raw: any)
⋮----
function sleep(ms: number)
⋮----
function randomDelayMs()
⋮----
// 500..1500
⋮----
function isValidImdbId(s: unknown): s is string
⋮----
function uniq<T>(arr: T[])
⋮----
function log(traceId: string | undefined, ...args: any[])
⋮----
// eslint-disable-next-line no-console
⋮----
export class TrailersController
⋮----
async trailers(
    @Query('limit') limitRaw: string | undefined,
    @Req() req: TraceRequest,
  ): Promise<
    ApiResponse<{
      inputFile: string;
      outputFile: string;
      limit: number;
      candidateCount: number;
      requestedCount: number;
      writtenCount: number;
      items: TitleDetailBody[];
    } | null>
  > {
    const started = Date.now();
⋮----
// 1) Read public/trailer_ids.json
⋮----
type TrailerIdRow = { imdb_id?: unknown; imdbId?: unknown; id?: unknown } | string;
⋮----
// ✅ limit enforced here
⋮----
// 2) Call /api/justus/titleDetail sequentially with 500..1500ms delay
⋮----
// ✅ CORRECT ENDPOINT
⋮----
// titleDetail often returns 206; treat 200/206 as success
⋮----
// 3) Write public/trailers_list.json (atomic)
`````

## File: src/parse/parse.controller.ts
`````typescript
import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { URL } from 'node:url';
import path from 'node:path';
import { BearerTokenGuard } from '../auth/bearer-token.guard';
import { chromium } from 'playwright';
⋮----
export class ParseController
⋮----
async parseHtml(
    @Query('url') urlStr: string | undefined,
    @Res() res: Response,
)
⋮----
// 1️⃣ Navigate
⋮----
// 2️⃣ Attempt consent click (best effort)
⋮----
// 3️⃣ Wait for app boot
⋮----
// 4️⃣ Click "Most Anticipated"
⋮----
// 5️⃣ Force lazy loading
⋮----
// 6️⃣ Final settle
`````

## File: postman/Railway_aSunder.postman_collection.json
`````json
{
  "info": {
    "_postman_id": "83d7118f-8c94-4326-a412-7096e63a3fd4",
    "name": "Railway_aSunder Copy",
    "description": "Test collection for the aSunder LLM Gateway endpoint used by pi-mono.",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    "_exporter_id": "50448986",
    "_collection_link": "https://go.postman.co/collection/50448986-83d7118f-8c94-4326-a412-7096e63a3fd4?source=collection_link"
  },
  "item": [
    {
      "name": "Responses API Prompt ID",
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{API_BEARER_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "x-trace-id",
            "value": "postman-prompt-001"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"prompt\": {\n    \"version\": \"1\"\n  },\n  \"input\": \"Explain what a gateway LLM bridge does in one paragraph.\",\n  \"model\": \"gpt-5.nano\"\n}"
        },
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/asunder/llmBridge",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "asunder",
            "llmBridge"
          ]
        }
      },
      "response": []
    },
    {
      "name": "CORS Preflight",
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{API_BEARER_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "OPTIONS",
        "header": [
          {
            "key": "Origin",
            "value": "http://localhost:3000"
          }
        ],
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/asunder/llmBridge",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "asunder",
            "llmBridge"
          ]
        }
      },
      "response": []
    },
    {
      "name": "Chat Completion (Non-Streaming)",
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{API_BEARER_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "x-trace-id",
            "value": "postman-test-001"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"model\": \"gpt-5-nano\",\n  \"stream\": false,\n  \"messages\": [\n    {\n      \"role\": \"system\",\n      \"content\": \"You are a helpful assistant.\"\n    },\n    {\n      \"role\": \"user\",\n      \"content\": \"Explain what a gateway LLM bridge does in one paragraph.\"\n    }\n  ]\n}\n"
        },
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/asunder/llmBridge",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "asunder",
            "llmBridge"
          ]
        }
      },
      "response": []
    },
    {
      "name": "Chat Completion (Streaming)",
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{API_BEARER_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Accept",
            "value": "text/event-stream"
          },
          {
            "key": "x-trace-id",
            "value": "postman-stream-001"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"model\": \"gpt-5-nano\",\n  \"stream\": true,\n  \"messages\": [\n    {\n      \"role\": \"system\",\n      \"content\": \"You are a helpful assistant.\"\n    },\n    {\n      \"role\": \"user\",\n      \"content\": \"Explain what a gateway LLM bridge does in one paragraph.\"\n    }\n  ]\n}\n"
        },
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/asunder/llmBridge",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "asunder",
            "llmBridge"
          ]
        }
      },
      "response": []
    },
    {
      "name": "Tool Call Example",
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{API_BEARER_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"model\": \"gpt-4.1\",\n  \"stream\": false,\n  \"messages\": [\n    {\n      \"role\": \"user\",\n      \"content\": \"What is the weather in Tokyo?\"\n    }\n  ],\n  \"tools\": [\n    {\n      \"type\": \"function\",\n      \"function\": {\n        \"name\": \"getWeather\",\n        \"description\": \"Get weather for a city\",\n        \"parameters\": {\n          \"type\": \"object\",\n          \"properties\": {\n            \"city\": {\n              \"type\": \"string\",\n              \"description\": \"City name to look up\"\n            }\n          },\n          \"required\": [\"city\"],\n          \"additionalProperties\": false\n        }\n      }\n    }\n  ],\n  \"tool_choice\": \"auto\"\n}\n"
        },
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/asunder/llmBridge",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "asunder",
            "llmBridge"
          ]
        }
      },
      "response": []
    },
    {
      "name": "Attachment Example",
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{API_BEARER_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "x-trace-id",
            "value": "postman-attach-001"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"model\": \"gpt-5-nano\",\n  \"stream\": false,\n  \"input\": \"Summarize the attached markdown file in 5 bullets.\",\n  \"attachments\": [\n    {\n      \"name\": \"sample.md\",\n      \"file_data\": \"data:text/plain;base64,SGVsbG8gd29ybGQ=\"\n    }\n  ]\n}\n"
        },
        "url": {
          "raw": "{{SERVER_BASE_URL}}/api/asunder/llmBridge",
          "host": [
            "{{SERVER_BASE_URL}}"
          ],
          "path": [
            "api",
            "asunder",
            "llmBridge"
          ]
        }
      },
      "response": []
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://kia-server-production.up.railway.app"
    },
    {
      "key": "token",
      "value": "YOUR_API_TOKEN"
    }
  ]
}
`````

## File: src/asunder/llmBridge.controller.ts
`````typescript
import { All, Controller, Options, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response as ExpressResponse } from 'express';
import { randomUUID } from 'node:crypto';
import { BearerTokenGuard } from '../auth/bearer-token.guard';
import { LlmBridgeError, LlmBridgeService } from './llmBridge.service';
⋮----
function isMultipart(req: Request): boolean
⋮----
function isJson(req: Request): boolean
⋮----
export class LlmBridgeController
⋮----
constructor(private readonly llmBridgeService: LlmBridgeService)
⋮----
options(@Req() req: Request, @Res() res: ExpressResponse)
⋮----
openPromptOptions(@Req() req: Request, @Res() res: ExpressResponse)
⋮----
async post(@Req() req: Request, @Res() res: ExpressResponse)
⋮----
async openPrompt(@Req() req: Request, @Res() res: ExpressResponse)
⋮----
methodNotAllowed(@Req() req: Request, @Res() res: ExpressResponse)
⋮----
openPromptMethodNotAllowed(@Req() req: Request, @Res() res: ExpressResponse)
⋮----
private async pipeSse(
    upstream: globalThis.Response,
    res: ExpressResponse,
    traceId: string,
)
⋮----
private async sendJson(
    upstream: globalThis.Response,
    res: ExpressResponse,
    traceId: string,
)
⋮----
private sendLocalError(res: ExpressResponse, traceId: string, error: unknown)
⋮----
private normalizeOpenPromptBody(value: unknown)
⋮----
private resolveTraceId(req: Request): string
`````

## File: src/main.ts
`````typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
⋮----
async function bootstrap()
`````

## File: Makefile
`````makefile
ifneq (,$(wildcard .env))
include .env
export
endif

PKG_NAME := $(shell npm pkg get name | tr -d '"')
PKG_VERSION := $(shell npm pkg get version | tr -d '"')
RN_VERSION := $(shell npm pkg get dependencies.react-native | tr -d '"')

serve:
	pnpm start:dev

bump:
	pnpm run bump

repomix:
	@mkdir -p temp
	@npx repomix@latest --style markdown -o temp/repomix-$(PKG_NAME)-$(PKG_VERSION).md
# smaller + more “structural” (less raw noise)
# npx repomix@latest --compress --parsable-style

git-push:
	@npm run bump
	@git add .
	@git commit -m "$(m)"
	@git push origin $(shell git rev-parse --abbrev-ref HEAD)

git-file:
	@git checkout -- $(m)

git-set:
	git remote set-url origin git@github.com-kiaspora:kiaspora/kia-mobile-app.git;ssh-add ~/.ssh/id_ed25519_kiaspora
`````

## File: src/asunder/llmBridge.service.spec.ts
`````typescript
import { LlmBridgeService } from './llmBridge.service';
`````

## File: src/kiaspora/kiaspora.module.ts
`````typescript
import { Module } from '@nestjs/common';
import { TranslationRouterController } from './translationRouter.controller';
import { TranslationRouterService } from './translationRouter.service';
import { TranslationChatModule } from './translationChat.module';
import { ImageScanModule } from './imageScan.module';
import { SpeechToTextModule } from './speechToText.module';
import { PromptConfigModule } from './promptConfig.module';
⋮----
export class KiasporaModule
`````

## File: .gitignore
`````
# compiled output
/dist
/node_modules
/build
/temp
.obsidian/

# Logs
logs
*.log
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS
.DS_Store

# Tests
/coverage
/.nyc_output

# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# IDE - VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# temp directory
.temp
.tmp

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json
.todos/

docs/Untitled*.md
docs/untitled*.md
.sidecar/
.sidecar-agent
.sidecar-task
.sidecar-pr
.sidecar-start.sh
.sidecar-base
.td-root
`````

## File: src/asunder/llmBridge.service.ts
`````typescript
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import Busboy from 'busboy';
⋮----
import { inferMimeFromFilename, parseBase64DataUrl } from './attachment.util';
⋮----
type ChatMessageRole = 'system' | 'developer' | 'user' | 'assistant' | 'tool';
type ChatMessage = {
  role: ChatMessageRole;
  [key: string]: unknown;
};
⋮----
type PromptRef = {
  id?: string;
  version?: string;
};
⋮----
type RequestedAttachment = {
  name: string;
  file_data?: string;
  path?: string;
};
⋮----
export type UploadedAttachment = {
  filename: string;
  mimeType: string;
  buffer: Buffer;
  size: number;
};
⋮----
type NormalizedAttachment = {
  filename: string;
  mimeType: string;
  fileData: string;
  size: number;
};
⋮----
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
⋮----
export class LlmBridgeError extends Error
⋮----
constructor(
    readonly statusCode: number,
    message: string,
    readonly body?: unknown,
)
⋮----
export class LlmBridgeService
⋮----
async parseMultipart(req: Request, traceId = 'llmBridge-trace'): Promise<
⋮----
const rejectOnce = (error: LlmBridgeError) =>
⋮----
async forward(
    requestBody: unknown,
    traceId: string,
    attachments: UploadedAttachment[] = [],
): Promise<globalThis.Response>
⋮----
private validateRequest(value: unknown): LlmBridgeRequest
⋮----
private buildUpstreamPayload(
    body: LlmBridgeRequest,
    defaultModel?: string,
    promptId?: string,
    promptVersion?: string,
    attachments: NormalizedAttachment[] = [],
)
⋮----
// Backward compatibility:
// Existing callers send Chat Completions-style { model, messages, ... }.
// New upstream is /v1/responses, so translate messages -> input.
⋮----
// Chat Completions function tools are nested under "function".
// Responses API expects function tool fields at the top level of each tool object.
⋮----
// If caller omitted model for prompt-based request, allow env default.
⋮----
// gpt-5 family rejects temperature on the Responses API.
⋮----
// Responses API uses max_output_tokens, not max_tokens.
⋮----
// Normalize prompt.version to string for consistency.
⋮----
private async normalizeAttachments(
    attachments: RequestedAttachment[] | undefined,
    uploadedAttachments: UploadedAttachment[],
    traceId: string,
): Promise<NormalizedAttachment[]>
⋮----
private buildResponsesInput(body: LlmBridgeRequest, attachments: NormalizedAttachment[])
⋮----
private buildMessageContent(
    content: unknown,
    role: ChatMessageRole,
    attachments: NormalizedAttachment[],
)
⋮----
private normalizeMessageContent(content: unknown)
⋮----
private buildFileContentItems(attachments: NormalizedAttachment[])
⋮----
private buildAttachmentInputMessage(attachments: NormalizedAttachment[])
⋮----
private parseAttachmentDataUrl(fileData: string)
⋮----
private validateNormalizedAttachment(filename: string, mimeType: string, size: number)
⋮----
private logNormalizedAttachment(
    traceId: string,
    filename: string,
    mimeType: string,
    size: number,
)
⋮----
private resolvePromptId(requestPromptId?: string, defaultPromptId?: string)
⋮----
private resolvePromptVersion(requestPromptVersion?: number)
⋮----
private invalidRequest(statusCode: number, message: string)
⋮----
private getUpstreamConfig()
⋮----
private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeoutMs: number,
): Promise<globalThis.Response>
`````

## File: src/app.module.ts
`````typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
⋮----
import { MetaController } from './meta/meta.controller';
import { ParseController } from './parse/parse.controller';
import { ImdbSearchController } from './parse/imdb-search.controller';
import { ImdbDetailController } from './parse/imdb-detail.controller';
⋮----
import { GenerateReviewModule } from './generate-review/generate-review.module';
import { JustUsModule } from './justus/justus.module';
import { AsunderModule } from './asunder/asunder.module';
⋮----
import { KiasporaModule } from './kiaspora/kiaspora.module';
⋮----
import { TraceIdMiddleware } from './common/trace-id.middleware';
import { TraceIdInterceptor } from './common/trace-id.interceptor';
⋮----
ConfigModule.forRoot({ isGlobal: true }), // loads .env
⋮----
export class AppModule implements NestModule
⋮----
configure(consumer: MiddlewareConsumer)
`````

## File: package.json
`````json
{
  "name": "kia-server",
  "version": "0.0.29",
  "description": "",
  "author": "",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "bump": "npm version patch --no-git-tag-version",
    "bump:minor": "npm version minor --no-git-tag-version",
    "bump:major": "npm version major --no-git-tag-version",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@google-cloud/speech": "^7.2.1",
    "@nestjs/common": "^11.0.1",
    "@nestjs/config": "^4.0.3",
    "@nestjs/core": "^11.0.1",
    "@nestjs/platform-express": "^11.0.1",
    "@nestjs/serve-static": "^5.0.4",
    "@nestjs/swagger": "^11.2.6",
    "busboy": "^1.6.0",
    "cheerio": "^1.2.0",
    "domhandler": "^5.0.3",
    "express-basic-auth": "^1.2.1",
    "pg": "^8.18.0",
    "playwright": "^1.58.2",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "swagger-ui-express": "^5.0.1"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.2.0",
    "@eslint/js": "^9.18.0",
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.1",
    "@types/express": "^5.0.0",
    "@types/jest": "^30.0.0",
    "@types/node": "^22.10.7",
    "@types/supertest": "^6.0.2",
    "eslint": "^9.18.0",
    "eslint-config-prettier": "^10.0.1",
    "eslint-plugin-prettier": "^5.2.2",
    "globals": "^16.0.0",
    "jest": "^30.0.0",
    "prettier": "^3.4.2",
    "source-map-support": "^0.5.21",
    "supertest": "^7.0.0",
    "ts-jest": "^29.2.5",
    "ts-loader": "^9.5.2",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.7.3",
    "typescript-eslint": "^8.20.0"
  },
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
`````
