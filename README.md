# kia-server

`kia-server` is a NestJS API that hosts multiple product-facing services behind one process:

- media/title lookup endpoints under `api/justus`
- LLM routing and bridge endpoints under `api/justus`, `api/asunder`, and `api/cutr`
- translation, OCR/image, prompt config, and speech endpoints under `api/kiaspora`
- parsing utilities under `api/parse`
- health and service metadata at `/status` and `/about`

The server is designed to run locally or on Railway, with bearer-token protection on the write and AI-facing routes.

## Tech Stack

- Node.js + NestJS
- TypeScript
- Express transport
- Swagger at `/docs` when enabled
- Jest for unit tests

## Project Layout

```text
src/
  app.module.ts              Root module wiring
  main.ts                    Bootstrap, body limits, Swagger
  auth/                      Bearer auth guard
  common/                    Trace ID middleware + interceptor
  asunder/                   OpenAI bridge / prompt proxy
  cutr/                      Multi-provider LLM router
  generate-review/           Review generation workflow
  justus/                    Title, trailer, and legacy router endpoints
  kiaspora/                  Translation, image scan, speech, prompt config
  meta/                      Status/about endpoints
  parse/                     HTML + IMDb parsing endpoints
docs/
  taste-engine.md            Review-generation design notes
  sop-setup.md               Setup and operational notes
postman/
  *.json                     Request collections for local/manual testing
```

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a local `.env` with the keys required for the endpoints you plan to use.

Common variables:

```bash
PORT=3000
NODE_ENV=development
ENABLE_SWAGGER=true
API_BEARER_TOKEN=...

OPENAI_API_KEY=...
OPENAI_KIA_API_KEY=...
OPENAI_ARCHETYPE_API_KEY=...
OPENAI_MODEL=gpt-5-nano

DEEPSEEK_API_KEY=...
GROQ_API_KEY=...

OMDB_API_KEY=...
GOOGLE_API_KEY=...

LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_URL=wss://...
```

Notes:

- `API_BEARER_TOKEN` is required by guarded routes such as `api/cutr/llmRouter` and `api/asunder/llmBridge`.
- `OPENAI_*`, `DEEPSEEK_*`, and `GROQ_*` are only required for the providers you call.
- `LIVEKIT_*` is required for `POST /voice/session`.
- Do not commit secrets. Keep `.env` local.

### 3. Start the server

```bash
npm run start:dev
```

The API listens on `http://localhost:3000` by default.

## Development Commands

```bash
npm run build
npm run start:dev
npm run test
npm run test:e2e
npm run lint
```

If Jest trips over local Watchman permissions, disable it explicitly:

```bash
JEST_WATCHMAN=0 npm test -- --watchman=false
```

## Auth

Guarded endpoints expect:

```http
Authorization: Bearer <API_BEARER_TOKEN>
```

Public endpoints include:

- `GET /status`
- `GET /about`
- Swagger docs at `GET /docs` when enabled

## Primary API Surface

### Meta

- `GET /status`
- `GET /about`

### Parse

- `GET /api/parse/html`
- `GET /api/parse/imdbSearch`
- `GET /api/parse/imdbDetail`

### JustUs

- `GET /api/justus/titleSearch`
- `GET /api/justus/titleDetail`
- `GET /api/justus/trailers`
- `GET /api/justus/filmTrailer`
- `POST /api/justus/llmRouter`
- `POST /api/justus/generateReview`

### Asunder

- `POST /api/asunder/llmBridge`
- `POST /api/asunder/openPrompt`

`llmBridge` supports JSON and multipart payloads and can proxy streaming responses.

### CUTR

- `POST /api/cutr/llmRouter`
- `POST /api/cutr/customPrompt`

`cutr` provides normalized multi-provider LLM responses across OpenAI, DeepSeek, and Groq.

#### `llmRouter`

`llmRouter` accepts `application/json` and `multipart/form-data` requests.

For multipart requests:

- send the normal request body as a `payload` form field containing JSON
- upload attachments under `file` or `files`

#### `customPrompt`

`customPrompt` accepts `multipart/form-data` only and is fixed to OpenAI provider.
Successful responses are returned as raw OpenAI Responses API payloads.
When `stream=true`, the upstream OpenAI stream is proxied through unchanged.

Form fields:

- `promptId`: non-empty string
- `promptVersion`: positive integer
- `payload`: valid JSON value (forwarded as OpenAI `input`)
- `stream`: boolean (default `false`)
- `model`: optional non-empty string override for the OpenAI model linked to the prompt, for example `gpt-4.1-mini`
- `file`: optional file upload (single file)
- `traceId`: optional text (used when no `x-trace-id` header)

Supported CUTR attachment types:

- JSON
- Markdown (`.md`)
- Plain text (`.txt`)
- XML (`.xml`)
- PDF (`.pdf`)

### Kiaspora

- `POST /api/kiaspora/translationRouter`
- `POST /api/kiaspora/translationChat`
- `POST /api/kiaspora/speechToText`
- `POST /api/kiaspora/imageScan`
- `GET/POST /api/kiaspora/promptConfig`
- `POST /voice/session`

#### `voice/session`

Creates a short-lived LiveKit room token and dispatches `kiaspora-voice-agent` in read-aloud or autoplay mode.

Request:

```json
{
  "mode": "single",
  "passageId": "genesis-1-1",
  "reference": "Genesis 1:1",
  "text": "In the beginning God created the heaven and the earth."
}
```

Autoplay request:

```json
{
  "mode": "autoplay",
  "initialPassage": {
    "passageId": "genesis-1-1",
    "reference": "Genesis 1:1",
    "text": "In the beginning God created the heaven and the earth."
  }
}
```

Response:

```json
{
  "roomName": "feed-genesis-1-1-a82fd4",
  "token": "...",
  "wsUrl": "wss://...",
  "reference": "Genesis 1:1",
  "server_time": "2026-06-02T18:00:00.000Z"
}
```

The endpoint is bearer-token guarded and requires `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, and `LIVEKIT_URL`.

## CUTR Response Contract

`/api/cutr/llmRouter` returns one universal schema regardless of provider. Frontends and analytics should consume this normalized shape instead of branching on provider-native response payloads. `/api/cutr/customPrompt` is excluded from this contract and returns raw OpenAI Responses API output instead.

Top-level fields:

- `content`
- `archetype`
- `provider`
- `model`
- `latency_ms`
- `usage`
- `performance`
- `routing`
- `telemetry`
- `raw_provider_meta`

See [`src/cutr/llmRouter.service.ts`](src/cutr/llmRouter.service.ts) for the normalization logic and [`src/cutr/llmRouter.service.spec.ts`](src/cutr/llmRouter.service.spec.ts) for provider mapping coverage.

## Traceability

The app assigns trace IDs via middleware and echoes them through AI-facing routes. For debugging:

- send `x-trace-id` on requests when reproducing issues
- check provider request IDs returned in response headers or `telemetry`
- preserve `raw_provider_meta` in logs if you need provider-level audit detail

## Manual Testing

Postman collections live under [`postman/`](postman). Use them for local smoke tests against:

- `api/asunder/llmBridge`
- `api/cutr/llmRouter`
- `api/justus/llmRouter`

## Notes For Maintainers

- This repo currently contains a live-looking `.env`. Treat it as sensitive material and rotate credentials if they have ever been shared outside a secure environment.
- When changing request or response contracts for LLM routes, update docs and specs in the same change.
