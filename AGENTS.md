## MANDATORY: Use td for Task Management

You must run `td usage --new-session` at conversation start (or after `/clear`) to see current work.
Use `td usage -q` for subsequent reads.

## Repo Purpose

This repository is a NestJS API server for KIA product surfaces. It combines:

- media/title APIs in `src/justus`
- provider-normalized LLM APIs in `src/cutr` and `src/asunder`
- translation, OCR/image, speech, and prompt endpoints in `src/kiaspora`
- parsing utilities in `src/parse`

## Working Rules

- Preserve existing endpoint contracts unless the user explicitly asks to change them.
- When editing LLM routes, keep provider normalization inside the service layer, not controllers.
- Do not leak provider-native response fields into the app-facing contract except under `raw_provider_meta`.
- Keep trace ID behavior intact. `x-trace-id` is part of the debugging flow.
- Bearer-token-protected routes depend on `API_BEARER_TOKEN`; do not remove or bypass the guard unless explicitly requested.
- Never print or copy secret values from `.env` into docs, code, commits, or responses.

## Documentation Rules

- Update `README.md` when adding, removing, or materially changing endpoints, auth requirements, or local setup.
- If you change CUTR response normalization, update both the docs and the tests in `src/cutr/llmRouter.service.spec.ts`.
- Prefer concise, repo-specific documentation. Do not restore generic Nest starter content.

## Testing Rules

- Prefer targeted Jest runs for touched modules before broader test runs.
- If local Jest fails because of Watchman permissions, rerun with:
  `JEST_WATCHMAN=0 npm test -- <pattern> --watchman=false`
- Add or update specs for request-shape and response-shape changes, especially on AI routes.

## File Map

- `src/main.ts`: bootstrap, body size limits, Swagger
- `src/app.module.ts`: module wiring
- `src/auth/bearer-token.guard.ts`: shared bearer auth
- `src/common/`: trace ID middleware and interceptor
- `src/cutr/`: universal LLM router
- `src/asunder/`: OpenAI bridge and prompt proxy
- `src/justus/`: title and trailer APIs, legacy router, review generation
- `src/kiaspora/`: translation, image scan, speech, prompt config
- `postman/`: manual endpoint collections
- `docs/`: operational and feature notes

## Editing Guidance

- Match the existing TypeScript/Nest style in touched files.
- Keep controllers thin and push provider logic into services.
- Prefer small, verifiable changes over broad rewrites.
